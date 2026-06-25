import { RecordHealthTelemetryService } from './record-health-telemetry.service';
import { HealthTelemetryRepository } from '../ports/out/health-telemetry.repository';

describe('RecordHealthTelemetryService', () => {
  let service: RecordHealthTelemetryService;
  let mockRepository: jest.Mocked<HealthTelemetryRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    service = new RecordHealthTelemetryService(mockRepository);
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

    await expect(service.execute(command)).rejects.toThrow('HealthTelemetry: Value cannot be negative');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
