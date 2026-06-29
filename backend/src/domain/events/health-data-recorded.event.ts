import { DomainEvent } from '../../shared/domain/domain-event.interface';

export interface HealthDataRecordedPayload {
  readonly userId: string;
  readonly metricType: import('../../domain/entities/health-telemetry.entity').MetricType;
  readonly value: number;
  readonly unit: import('../../domain/entities/health-telemetry.entity').MetricUnit;
  readonly deviceTimestamp: number;
}

export class HealthDataRecorded implements DomainEvent<HealthDataRecordedPayload> {
  public readonly eventName = 'health_telemetry.recorded';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: HealthDataRecordedPayload,
  ) {}
}
