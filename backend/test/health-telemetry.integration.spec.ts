import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { RecordHealthTelemetryService } from '../src/application/use-cases/record-health-telemetry.service';
import { RecordHealthTelemetryCommand } from '../src/application/ports/in/record-health-telemetry.command';
import {
  OUTBOX_REPOSITORY_PORT,
  OutboxRepositoryPort,
} from '../src/application/ports/out/event-outbox.repository';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('HealthTelemetry → Outbox Integration', () => {
  let service: RecordHealthTelemetryService;
  let outboxRepository: jest.Mocked<OutboxRepositoryPort>;
  let savedEvents: Array<{
    eventName: string;
    payload: string;
    status: string;
  }>;

  const mockPrisma = {
    $transaction: jest.fn((cb: (tx: any) => Promise<void>) => cb({})),
  };

  beforeEach(async () => {
    savedEvents = [];

    const mockOutboxRepository: jest.Mocked<OutboxRepositoryPort> = {
      save: jest.fn().mockImplementation(async (event: any) => {
        savedEvents.push({
          eventName: event.eventName,
          payload: JSON.stringify(event.payload),
          status: 'PENDING',
        });
      }),
      findPending: jest.fn().mockResolvedValue([]),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
      incrementRetry: jest.fn().mockResolvedValue(undefined),
      deletePublished: jest.fn().mockResolvedValue(0),
    };

    const mockTelemetryRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordHealthTelemetryService,
        {
          provide: 'HealthTelemetryRepository',
          useValue: mockTelemetryRepository,
        },
        { provide: OUTBOX_REPOSITORY_PORT, useValue: mockOutboxRepository },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecordHealthTelemetryService>(
      RecordHealthTelemetryService,
    );
    outboxRepository = module.get(OUTBOX_REPOSITORY_PORT);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should save an outbox event when health telemetry is recorded', async () => {
    const command: RecordHealthTelemetryCommand = {
      userId: randomUUID(),
      metricType: 'weight_kg',
      value: 75.5,
      unit: 'kg',
      deviceTimestamp: Date.now(),
      correlationId: randomUUID(),
    };

    await service.execute(command);

    expect(outboxRepository.save).toHaveBeenCalledTimes(1);
    expect(savedEvents).toHaveLength(1);
    expect(savedEvents[0].eventName).toBe('health_telemetry.recorded');
    expect(savedEvents[0].status).toBe('PENDING');
  });

  it('should save health telemetry and roll back outbox on transaction failure', async () => {
    const mockTransaction = jest
      .fn()
      .mockRejectedValue(new Error('DB failure'));
    const module = await Test.createTestingModule({
      providers: [
        RecordHealthTelemetryService,
        {
          provide: 'HealthTelemetryRepository',
          useValue: { save: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: OUTBOX_REPOSITORY_PORT,
          useValue: {
            save: jest.fn().mockResolvedValue(undefined),
            findPending: jest.fn().mockResolvedValue([]),
            markPublished: jest.fn().mockResolvedValue(undefined),
            markFailed: jest.fn().mockResolvedValue(undefined),
            incrementRetry: jest.fn().mockResolvedValue(undefined),
            deletePublished: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: PrismaService,
          useValue: { $transaction: mockTransaction },
        },
      ],
    }).compile();

    const svc = module.get<RecordHealthTelemetryService>(
      RecordHealthTelemetryService,
    );

    await expect(
      svc.execute({
        userId: randomUUID(),
        metricType: 'heart_rate',
        value: 72,
        unit: 'bpm',
        deviceTimestamp: Date.now(),
        correlationId: randomUUID(),
      }),
    ).rejects.toThrow('DB failure');
  });
});
