export interface TelemetryEntry {
  metricType: string;
  value: number;
  unit: string;
  recordedAt: number;
}

export interface HealthDataContext {
  userId: string;
  recentTelemetry: TelemetryEntry[];
  userState?: string;
}
