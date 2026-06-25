import { RecordHealthTelemetryCommand } from './record-health-telemetry.command';

export interface RecordHealthTelemetryUseCase {
  execute(command: RecordHealthTelemetryCommand): Promise<void>;
}
