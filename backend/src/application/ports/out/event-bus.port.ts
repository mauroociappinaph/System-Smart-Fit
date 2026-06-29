import { DomainEvent } from '../../../shared/domain/domain-event.interface';

export interface EventBusPort {
  publish(event: DomainEvent<unknown>): Promise<void>;
  publishAll(events: DomainEvent<unknown>[]): Promise<void>;
}

export const EVENT_BUS_PORT = 'EventBusPort';
