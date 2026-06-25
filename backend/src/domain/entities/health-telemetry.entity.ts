import { HealthDataRecorded } from '../events/health-data-recorded.event';

export class HealthTelemetry {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _metricType: string,
    private readonly _value: number,
    private readonly _unit: string,
    private readonly _deviceTimestamp: number,
    private readonly _serverReceivedAt: number,
    private readonly _correlationId: string,
  ) {}

  public get id(): string { return this._id; }
  public get userId(): string { return this._userId; }
  public get metricType(): string { return this._metricType; }
  public get value(): number { return this._value; }
  public get unit(): string { return this._unit; }
  public get correlationId(): string { return this._correlationId; }

  /**
   * Factory method to create a new HealthTelemetry instance and its corresponding domain event.
   * IDs and timestamps must be injected to preserve purity (Hexagonal Architecture).
   */
  public static record(
    id: string,
    eventId: string,
    userId: string,
    metricType: string,
    value: number,
    unit: string,
    deviceTimestamp: number,
    serverReceivedAt: number,
    correlationId: string,
  ): { entity: HealthTelemetry; event: HealthDataRecorded } {
    
    // Guard Clauses to prevent invalid states
    if (!userId || !metricType || !unit) {
      throw new Error('HealthTelemetry: Missing required string fields');
    }
    if (value < 0) {
      throw new Error('HealthTelemetry: Value cannot be negative');
    }

    const entity = new HealthTelemetry(
      id,
      userId,
      metricType,
      value,
      unit,
      deviceTimestamp,
      serverReceivedAt,
      correlationId,
    );

    const event = new HealthDataRecorded(
      eventId,
      correlationId,
      serverReceivedAt,
      {
        userId,
        metricType,
        value,
        unit,
        deviceTimestamp,
      }
    );

    return { entity, event };
  }
}
