import { Module } from '@nestjs/common';
import { HealthTelemetryController } from '../../presentation/controllers/health-telemetry.controller';
import { RecordHealthTelemetryService } from '../../application/use-cases/record-health-telemetry.service';

// Mock Provider until we build the real Postgres adapter in Infrastructure
const mockRepositoryProvider = {
  provide: 'HealthTelemetryRepository',
  useValue: { save: async () => {} },
};

@Module({
  controllers: [HealthTelemetryController],
  providers: [RecordHealthTelemetryService, mockRepositoryProvider],
})
export class HealthTelemetryModule {}
