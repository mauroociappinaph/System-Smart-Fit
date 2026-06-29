import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { EventBusPort } from '../../application/ports/out/event-bus.port';
import { EVENT_BUS_PORT } from '../../application/ports/out/event-bus.port';
import { Inject } from '@nestjs/common';
import type { OutboxRepositoryPort } from '../../application/ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../../application/ports/out/event-outbox.repository';

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    @Inject(EVENT_BUS_PORT)
    private readonly eventBus: EventBusPort,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processPendingEvents(): Promise<void> {
    const pending = await this.outboxRepository.findPending(50);
    if (pending.length === 0) return;

    this.logger.log(`Processing ${pending.length} pending outbox events...`);

    const toPublish = pending.map(e => ({
      eventName: e.eventName,
      payload: e.payload,
      metadata: { correlationId: e.correlationId, outboxId: e.id },
    }));

    try {
      await this.eventBus.publishAll(toPublish as any);
      const ids = pending.map(e => e.id);
      await Promise.all(ids.map(id => this.outboxRepository.markPublished(id)));
      this.logger.log(`Published ${ids.length} events successfully`);
    } catch (err) {
      this.logger.error(`Failed to publish batch: ${(err as Error).message}`);
      // Mark as failed with retry logic
      for (const entry of pending) {
        const maxRetries = 5;
        if (entry.retryCount >= maxRetries) {
          await this.outboxRepository.markFailed(entry.id, `Max retries exceeded: ${(err as Error).message}`);
        } else {
          await this.outboxRepository.incrementRetry(entry.id);
        }
      }
    }
  }
}
