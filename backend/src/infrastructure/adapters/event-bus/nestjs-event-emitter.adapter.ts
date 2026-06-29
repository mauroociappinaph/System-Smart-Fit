import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '@/shared/domain/domain-event.interface';
import { EventBusPort, EVENT_BUS_PORT } from '@/application/ports/out/event-bus.port';

@Injectable()
export class NestjsEventEmitterAdapter implements EventBusPort {
  private readonly logger = new Logger(NestjsEventEmitterAdapter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: DomainEvent<unknown>): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(event.eventName, event);
      this.logger.debug(`Event published: ${event.eventName}`, {
        eventId: event.eventId,
        correlationId: event.correlationId,
      });
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventName}`, {
        eventId: event.eventId,
        correlationId: event.correlationId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Fire-and-forget: don't throw to preserve transaction integrity
    }
  }

  async publishAll(events: DomainEvent<unknown>[]): Promise<void> {
    await Promise.all(
      events.map((event) => this.publish(event)),
    );
  }
}

export const NESTJS_EVENT_EMITTER_ADAPTER_PROVIDER = {
  provide: EVENT_BUS_PORT,
  useClass: NestjsEventEmitterAdapter,
};