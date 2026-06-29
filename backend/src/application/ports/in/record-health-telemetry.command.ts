export interface RecordHealthTelemetryCommand {
  readonly userId: string;
  readonly metricType: import('../../../domain/entities/health-telemetry.entity').MetricType;
  readonly value: number;
  readonly unit: import('../../../domain/entities/health-telemetry.entity').MetricUnit;
  readonly deviceTimestamp: number;
  readonly correlationId?: string;
}
