import { Test, TestingModule } from '@nestjs/testing';
import { HealthTelemetryController } from './health-telemetry.controller';
import { RecordHealthTelemetryService } from '../../application/use-cases/record-health-telemetry.service';
import { RecordHealthTelemetryRequestDto } from '../dtos/record-health-telemetry.request.dto';

describe('HealthTelemetryController', () => {
  let controller: HealthTelemetryController;
  let mockService: jest.Mocked<RecordHealthTelemetryService>;

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthTelemetryController],
      providers: [
        {
          provide: RecordHealthTelemetryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<HealthTelemetryController>(
      HealthTelemetryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service with the mapped DTO', async () => {
    const dto: RecordHealthTelemetryRequestDto = {
      userId: 'user-1',
      metricType: 'heart_rate',
      value: 120,
      unit: 'bpm',
      deviceTimestamp: Date.now(),
      correlationId: 'corr-1',
    };

    await controller.recordTelemetry(dto);

    expect(mockService.execute).toHaveBeenCalledWith(dto);
  });
});
