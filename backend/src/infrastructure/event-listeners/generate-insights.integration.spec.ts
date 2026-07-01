import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { GenerateInsightsOnTelemetryListener } from './generate-insights-on-telemetry.listener';
import { GenerateAndPersistInsightsUseCase } from '../../application/use-cases/generate-and-persist-insights.use-case';
import { HealthDataRecorded } from '../../domain/events/health-data-recorded.event';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import { NIMAdapter } from '../../infrastructure/inference/nim.adapter';
import { MistralAdapter } from '../../infrastructure/inference/mistral.adapter';
import { FallbackAdapter } from '../../infrastructure/inference/fallback.adapter';
import { GENERATE_INSIGHTS_PORT } from '../../application/ports/out/generate-insights.port';
import { AgentInsightRepository } from '../../application/ports/out/agent-insight.repository';
import { OUTBOX_REPOSITORY_PORT } from '../../application/ports/out/event-outbox.repository';
import { HealthTelemetryRepository } from '../../application/ports/out/health-telemetry.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { HealthDataNormalizer } from '../../application/services/health-data-normalizer';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('GenerateInsights Integration Flow', () => {
  let eventEmitter: EventEmitter2;
  let listener: GenerateInsightsOnTelemetryListener;
  let agentInsightRepository: jest.Mocked<AgentInsightRepository>;
  let outboxRepository: jest.Mocked<any>;
  let telemetryRepository: jest.Mocked<HealthTelemetryRepository>;
  let prismaService: jest.Mocked<PrismaService>;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let nimAdapter: NIMAdapter;
  let mistralAdapter: MistralAdapter;

  beforeEach(async () => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;
    (OpenAI as jest.Mock).mockImplementation(() => mockOpenAI);

    agentInsightRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    outboxRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    telemetryRepository = {
      findByUserId: jest.fn().mockResolvedValue([]),
    } as any;

    prismaService = {
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(prismaService)),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateInsightsOnTelemetryListener,
        GenerateAndPersistInsightsUseCase,
        HealthDataNormalizer,
        {
          provide: 'NimAdapter',
          useClass: NIMAdapter,
        },
        {
          provide: 'MistralAdapter',
          useClass: MistralAdapter,
        },
        {
          provide: GENERATE_INSIGHTS_PORT,
          useFactory: (nim: NIMAdapter, mistral: MistralAdapter) => {
            return new FallbackAdapter(nim, mistral);
          },
          inject: ['NimAdapter', 'MistralAdapter'],
        },
        { provide: 'AgentInsightRepository', useValue: agentInsightRepository },
        { provide: OUTBOX_REPOSITORY_PORT, useValue: outboxRepository },
        { provide: 'HealthTelemetryRepository', useValue: telemetryRepository },
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
            getOrThrow: jest.fn().mockReturnValue('mock-key'),
          },
        },
        EventEmitter2,
      ],
    }).compile();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    listener = module.get<GenerateInsightsOnTelemetryListener>(
      GenerateInsightsOnTelemetryListener,
    );
    nimAdapter = module.get<NIMAdapter>('NimAdapter');
    mistralAdapter = module.get<MistralAdapter>('MistralAdapter');
  });

  it('should complete the full pipeline flow successfully', async () => {
    const userId = 'user-123';
    const correlationId = 'corr-123';
    const telemetryId = 'tel-123';

    // 1. Mock telemetry data
    telemetryRepository.findByUserId.mockResolvedValue([
      {
        metricType: 'heart_rate',
        value: 75,
        unit: 'bpm',
        serverReceivedAt: new Date(),
      },
    ] as any);

    // 2. Mock OpenAI response
    const mockInsights = [
      {
        category: 'exercise',
        content: '¡Buen trabajo con tu ritmo cardíaco!',
        score: 85,
      },
    ];
    (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockInsights),
          },
        },
      ],
    });

    // 3. Create event
    const event = new HealthDataRecorded(
      'event-id',
      correlationId,
      Date.now(),
      {
        userId,
        metricType: 'heart_rate',
        value: 75,
        unit: 'bpm',
        deviceTimestamp: Date.now(),
      },
    );

    // 4. Emit event and wait
    await listener.handle(event);

    // 5. Assertions
    expect(telemetryRepository.findByUserId).toHaveBeenCalledWith(userId, {
      limit: 10,
    });
    expect(agentInsightRepository.save).toHaveBeenCalled();
    expect(outboxRepository.save).toHaveBeenCalled();
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
  });

  it('should use MistralAdapter as fallback when NIMAdapter fails', async () => {
    const userId = 'user-123';
    const correlationId = 'corr-123';
    const telemetryId = 'tel-123';

    // 1. Mock telemetry data
    telemetryRepository.findByUserId.mockResolvedValue([
      {
        metricType: 'heart_rate',
        value: 75,
        unit: 'bpm',
        serverReceivedAt: new Date(),
      },
    ] as any);

    // 2. Mock NIM failure
    (mockOpenAI.chat.completions.create as jest.Mock)
      .mockRejectedValueOnce(new Error('NIM Connection Error'))
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  category: 'exercise',
                  content: 'Fallback success!',
                  score: 90,
                },
              ]),
            },
          },
        ],
      });

    // 3. Create event
    const event = new HealthDataRecorded(
      'event-id',
      correlationId,
      Date.now(),
      {
        userId,
        metricType: 'heart_rate',
        value: 75,
        unit: 'bpm',
        deviceTimestamp: Date.now(),
      },
    );

    // 4. Emit event and wait
    await listener.handle(event);

    // 5. Assertions
    expect(telemetryRepository.findByUserId).toHaveBeenCalledWith(userId, {
      limit: 10,
    });
    expect(agentInsightRepository.save).toHaveBeenCalled();
    expect(outboxRepository.save).toHaveBeenCalled();
    // Verify that it called OpenAI twice (once for NIM, once for Mistral)
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });
});
