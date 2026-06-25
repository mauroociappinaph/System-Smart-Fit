export interface DomainEvent<T> {
  readonly eventId: string;
  readonly eventName: string;
  readonly correlationId: string;
  readonly version: string;
  readonly occurredOn: number;
  readonly payload: T;
}
