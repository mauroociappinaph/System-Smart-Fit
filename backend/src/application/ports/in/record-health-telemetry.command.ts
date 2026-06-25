export interface RecordHealthTelemetryCommand {
  readonly userId: string;
  readonly metricType: string;
  readonly value: number;
  readonly unit: string;
  readonly deviceTimestamp: number;
  readonly correlationId?: string;
}
