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
        payload: event.payload !== undefined ? JSON.stringify(event.payload) : 'null',
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

    return records.map((r) => this.toDomain(r));
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id, status: 'PENDING' },
      data: {
        status: 'PUBLISHED',
        publishedAt: Date.now(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id, status: 'PENDING' },
      data: {
        status: 'FAILED',
        error,
        retryCount: { increment: 1 },
      },
    });
  }

  async incrementRetry(id: string): Promise<void> {
    await this.prisma.eventOutbox.update({
      where: { id, status: 'PENDING' },
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

  private safeBigIntToNumber(value: bigint): number {
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new Error(`BigInt value ${value} exceeds safe integer range`);
    }
    return Number(value);
  }

  private toDomain(record: {
    id: string;
    eventName: string;
    payload: string;
    status: OutboxEntry['status'];
    createdAt: bigint;
    publishedAt: bigint | null;
    error: string | null;
    retryCount: number;
  }): OutboxEntry {
    return {
      id: record.id,
      eventName: record.eventName,
      payload: record.payload,
      status: record.status,
      createdAt: this.safeBigIntToNumber(record.createdAt),
      publishedAt: record.publishedAt !== null ? this.safeBigIntToNumber(record.publishedAt) : null,
      error: record.error,
      retryCount: record.retryCount,
    };
  }
}
