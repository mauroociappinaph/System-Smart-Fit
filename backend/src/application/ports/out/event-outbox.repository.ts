import { DomainEvent } from '@/shared/domain/domain-event.interface';

export interface OutboxEntry {
  id: string;
  eventName: string;
  payload: string; // JSON serialized
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  createdAt: number;
  publishedAt: number | null;
  error: string | null;
  retryCount: number;
}

export const OUTBOX_REPOSITORY_PORT = Symbol('OutboxRepositoryPort');

export interface OutboxRepositoryPort {
  save(event: DomainEvent<unknown>): Promise<void>;
  findPending(limit?: number, olderThanMs?: number): Promise<OutboxEntry[]>;
  markPublished(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  incrementRetry(id: string): Promise<void>;
  deletePublished(olderThanMs: number): Promise<number>;
}
