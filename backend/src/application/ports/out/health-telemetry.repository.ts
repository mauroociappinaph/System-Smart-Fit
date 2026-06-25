import { HealthTelemetry } from '../../../domain/entities/health-telemetry.entity';

export interface HealthTelemetryRepository {
  save(telemetry: HealthTelemetry): Promise<void>;
}
