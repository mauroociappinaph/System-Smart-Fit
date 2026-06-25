import { Module } from '@nestjs/common';
import { HealthTelemetryController } from '../../presentation/controllers/health-telemetry.controller';
import { RecordHealthTelemetryService } from '../../application/use-cases/record-health-telemetry.service';
import { HealthTelemetryPrismaRepository } from '../../infrastructure/persistence/health-telemetry-prisma.repository';

@Module({
  controllers: [HealthTelemetryController],
  providers: [
    RecordHealthTelemetryService,
    {
      provide: 'HealthTelemetryRepository',
      useClass: HealthTelemetryPrismaRepository,
    },
  ],
})
export class HealthTelemetryModule {}
