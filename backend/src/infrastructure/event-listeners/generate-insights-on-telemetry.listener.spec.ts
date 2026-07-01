import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GenerateInsightsOnTelemetryListener } from './generate-insights-on-telemetry.listener';
import { GenerateAndPersistInsightsUseCase } from '../../application/use-cases/generate-and-persist-insights.use-case';
import { HealthDataRecorded } from '../../domain/events/health-data-recorded.event';

describe('GenerateInsightsOnTelemetryListener', () => {
  let listener: GenerateInsightsOnTelemetryListener;
  let eventEmitter: EventEmitter2;
  let generateAndPersistInsightsUseCase: jest.Mocked<GenerateAndPersistInsightsUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue({
        insights: [],
        events: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateInsightsOnTelemetryListener,
        {
          provide: GenerateAndPersistInsightsUseCase,
          useValue: mockUseCase,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    listener = module.get<GenerateInsightsOnTelemetryListener>(
      GenerateInsightsOnTelemetryListener,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    generateAndPersistInsightsUseCase = module.get(
      GenerateAndPersistInsightsUseCase,
    );
  });

  it('should call GenerateAndPersistInsightsUseCase when health_telemetry.recorded event is emitted (after debounce)', async () => {
    jest.useFakeTimers();
    const payload = {
      userId: 'user-123',
      metricType: 'heart_rate',
      value: 75,
      unit: 'bpm',
      deviceTimestamp: Date.now(),
    };
    const event = new HealthDataRecorded(
      'event-id',
      'correlation-id',
      Date.now(),
      payload,
    );

    // Manually trigger the handler since we are testing the listener's reaction to the event
    await listener.handle(event);

    // Advance timers to trigger the debounce (5s)
    jest.advanceTimersByTime(5001);

    // Wait for the async pipeline to complete
    await Promise.resolve();
    await Promise.resolve();

    expect(generateAndPersistInsightsUseCase.execute).toHaveBeenCalledWith({
      userId: payload.userId,
      correlationId: event.correlationId,
      telemetryId: event.eventId,
      userState: undefined,
    });

    jest.useRealTimers();
  });
});
