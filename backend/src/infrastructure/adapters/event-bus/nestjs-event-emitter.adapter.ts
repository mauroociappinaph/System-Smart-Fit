import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '@/shared/domain/domain-event.interface';
import { EventBusPort, EVENT_BUS_PORT } from '@/application/ports/out/event-bus.port';

@Injectable()
export class NestjsEventEmitterAdapter implements EventBusPort {
  private readonly logger = new Logger(NestjsEventEmitterAdapter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: DomainEvent<unknown>): Promise<void> {
    await this.eventEmitter.emitAsync(event.eventName, event);
    this.logger.debug(`Event published: ${event.eventName}`, {
      eventId: event.eventId,
      correlationId: event.correlationId,
    });
  }

  async publishAll(events: DomainEvent<unknown>[]): Promise<void> {
    const settled = await Promise.allSettled(
      events.map((event) => this.publish(event)),
    );

    const failures = settled.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    if (failures.length > 0) {
      const errors = failures.map((r) => r.reason);
      this.logger.error(
        `Failed to publish ${failures.length}/${events.length} events`,
        errors,
      );
      throw errors[0];
    }
  }
}

export const NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER = {
  provide: EVENT_BUS_PORT,
  useClass: NestjsEventEmitterAdapter,
};