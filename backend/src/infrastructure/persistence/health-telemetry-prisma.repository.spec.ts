import { Test, TestingModule } from '@nestjs/testing';
import { HealthTelemetryPrismaRepository } from './health-telemetry-prisma.repository';
import { PrismaService } from '../prisma/prisma.service';
import { HealthTelemetry } from '../../domain/entities/health-telemetry.entity';

describe('HealthTelemetryPrismaRepository', () => {
  let repository: HealthTelemetryPrismaRepository;
  let prismaService: { healthTelemetry: { create: jest.Mock } };

  const mockEntity = {
    id: 'entity-id-1',
    userId: 'user-123',
    metricType: 'heart_rate',
    value: 72,
    unit: 'bpm',
    deviceTimestamp: 1700000000000,
    serverReceivedAt: 1700000001000,
    correlationId: 'corr-abc-123',
  };

  beforeEach(async () => {
    prismaService = {
      healthTelemetry: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthTelemetryPrismaRepository,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    repository = module.get<HealthTelemetryPrismaRepository>(
      HealthTelemetryPrismaRepository,
    );
  });

  describe('save', () => {
    it('should call prisma.healthTelemetry.create with correct mapped data', async () => {
      const { entity } = HealthTelemetry.record(
        mockEntity.id,
        'event-id-1',
        mockEntity.userId,
        mockEntity.metricType,
        mockEntity.value,
        mockEntity.unit,
        mockEntity.deviceTimestamp,
        mockEntity.serverReceivedAt,
        mockEntity.correlationId,
      );

      await repository.save(entity);

      expect(prismaService.healthTelemetry.create).toHaveBeenCalledTimes(1);
      expect(prismaService.healthTelemetry.create).toHaveBeenCalledWith({
        data: {
          id: mockEntity.id,
          userId: mockEntity.userId,
          metricType: mockEntity.metricType,
          value: mockEntity.value,
          unit: mockEntity.unit,
          deviceTimestamp: mockEntity.deviceTimestamp,
          serverReceivedAt: mockEntity.serverReceivedAt,
          correlationId: mockEntity.correlationId,
        },
      });
    });

    it('should propagate prisma errors', async () => {
      const dbError = new Error('Connection refused');
      prismaService.healthTelemetry.create.mockRejectedValue(dbError);

      const { entity } = HealthTelemetry.record(
        mockEntity.id,
        'event-id-2',
        mockEntity.userId,
        mockEntity.metricType,
        mockEntity.value,
        mockEntity.unit,
        mockEntity.deviceTimestamp,
        mockEntity.serverReceivedAt,
        mockEntity.correlationId,
      );

      await expect(repository.save(entity)).rejects.toThrow(
        'Connection refused',
      );
    });
  });
});
