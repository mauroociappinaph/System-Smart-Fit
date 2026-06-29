import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '@/shared/domain/domain-event.interface';
import {
  OutboxRepositoryPort,
  OutboxEntry,
} from '@/application/ports/out/event-outbox.repository';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaOutboxRepository implements OutboxRepositoryPort {
  private readonly logger = new Logger(PrismaOutboxRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(event: DomainEvent<unknown>): Promise<void> {
    const now = Date.now();

    await this.prisma.eventOutbox.create({
      data: {
        id: event.eventId,
        eventName: event.eventName,
        payload: JSON.stringify(event),
        status: 'PENDING',
        createdAt: now,
      },
    });

    this.logger.debug(`Outbox entry saved: ${event.eventId} (${event.eventName})`);
  }

  async findPending(limit = 50, olderThanMs = 5_000): Promise<OutboxEntry[]> {
    const cutoff = Date.now() - olderThanMs;

    const records = await this.prisma.eventOutbox.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lte: cutoff },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return records.map(this.toDomain);
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: Date.now(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id },
      data: {
        status: 'FAILED',
        error,
      },
    });
  }

  async incrementRetry(id: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
      },
    });
  }

  async deletePublished(olderThanMs: number): Promise<number> {
    const cutoff = Date.now() - olderThanMs;

    const result = await this.prisma.eventOutbox.deleteMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: cutoff },
      },
    });

    return result.count;
  }

  private toDomain(record: {
    id: string;
    eventName: string;
    payload: string;
    status: string;
    createdAt: bigint;
    publishedAt: bigint | null;
    error: string | null;
    retryCount: number;
  }): OutboxEntry {
    return {
      id: record.id,
      eventName: record.eventName,
      payload: record.payload,
      status: record.status as OutboxEntry['status'],
      createdAt: Number(record.createdAt),
      publishedAt: record.publishedAt !== null ? Number(record.publishedAt) : null,
      error: record.error,
      retryCount: record.retryCount,
    };
  }
}
