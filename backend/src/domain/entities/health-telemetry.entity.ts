import { HealthDataRecorded } from '../events/health-data-recorded.event';
import { MissingRequiredFieldError } from '../../shared/domain/error/missing-required-field.error';
import { InvalidFieldValueError } from '../../shared/domain/error/invalid-field-value.error';

export type MetricType =
  | 'weight_kg'
  | 'height_cm'
  | 'bmi'
  | 'heart_rate'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'steps'
  | 'calories_burned'
  | 'sleep_hours'
  | 'blood_glucose'
  | 'body_fat_pct'
  | (string & {});

export type MetricUnit =
  | 'kg'
  | 'cm'
  | 'bpm'
  | 'mmHg'
  | 'steps'
  | 'kcal'
  | 'hours'
  | 'mg_dL'
  | '%'
  | (string & {});

export class HealthTelemetry {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _metricType: MetricType,
    private readonly _value: number,
    private readonly _unit: MetricUnit,
    private readonly _deviceTimestamp: number,
    private readonly _serverReceivedAt: number,
    private readonly _correlationId: string,
  ) {}

  public get id(): string { return this._id; }
  public get userId(): string { return this._userId; }
  public get metricType(): MetricType { return this._metricType; }
  public get value(): number { return this._value; }
  public get unit(): MetricUnit { return this._unit; }
  public get deviceTimestamp(): number { return this._deviceTimestamp; }
  public get serverReceivedAt(): number { return this._serverReceivedAt; }
  public get correlationId(): string { return this._correlationId; }

  /**
   * Factory method to create a new HealthTelemetry instance and its corresponding domain event.
   * IDs and timestamps must be injected to preserve purity (Hexagonal Architecture).
   */
  public static record(
    id: string,
    eventId: string,
    userId: string,
    metricType: MetricType,
    value: number,
    unit: MetricUnit,
    deviceTimestamp: number,
    serverReceivedAt: number,
    correlationId: string,
  ): { entity: HealthTelemetry; event: HealthDataRecorded } {
    
    // Guard Clauses to prevent invalid states
    if (!userId) {
      throw new MissingRequiredFieldError('HealthTelemetry', 'userId');
    }
    if (!metricType) {
      throw new MissingRequiredFieldError('HealthTelemetry', 'metricType');
    }
    if (!unit) {
      throw new MissingRequiredFieldError('HealthTelemetry', 'unit');
    }
    if (value < 0) {
      throw new InvalidFieldValueError('HealthTelemetry', 'value', 'cannot be negative');
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
