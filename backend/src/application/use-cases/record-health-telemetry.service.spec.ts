import { RecordHealthTelemetryService } from './record-health-telemetry.service';
import { HealthTelemetryRepository } from '../ports/out/health-telemetry.repository';
import { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';

describe('RecordHealthTelemetryService', () => {
  let service: RecordHealthTelemetryService;
  let mockRepository: jest.Mocked<HealthTelemetryRepository>;
  let mockOutbox: jest.Mocked<OutboxRepositoryPort>;
  let mockPrisma: { $transaction: jest.Mock };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn().mockResolvedValue([]),
    };
    mockOutbox = {
      save: jest.fn().mockResolvedValue(undefined),
      findPending: jest.fn().mockResolvedValue([]),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
      incrementRetry: jest.fn().mockResolvedValue(undefined),
      deletePublished: jest.fn().mockResolvedValue(0),
    };
    mockPrisma = {
      $transaction: jest.fn((cb: (tx: any) => Promise<void>) => cb({})),
    };
    service = new RecordHealthTelemetryService(
      mockRepository,
      mockOutbox,
      mockPrisma as any,
    );
  });

  it('should successfully record telemetry and save to repository', async () => {
    const command = {
      userId: 'user-1',
      metricType: 'heart_rate',
      value: 120,
      unit: 'bpm',
      deviceTimestamp: Date.now(),
    };

    await service.execute(command);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
    const savedEntity = mockRepository.save.mock.calls[0][0];
    expect(savedEntity.userId).toBe('user-1');
    expect(savedEntity.value).toBe(120);
  });

  it('should throw an error if telemetry value is negative (Domain validation)', async () => {
    const command = {
      userId: 'user-2',
      metricType: 'heart_rate',
      value: -10, // Invalid value
      unit: 'bpm',
      deviceTimestamp: Date.now(),
    };

    await expect(service.execute(command)).rejects.toThrow(
      'HealthTelemetry: Invalid value for field "value"',
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
