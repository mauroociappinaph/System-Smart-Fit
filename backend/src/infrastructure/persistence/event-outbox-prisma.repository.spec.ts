import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaOutboxRepository } from './event-outbox-prisma.repository';
import { DomainEvent } from '../../shared/domain/domain-event.interface';

class TestEvent implements DomainEvent<{ value: string }> {
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly eventName: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: { value: string },
  ) {}
}

describe('PrismaOutboxRepository', () => {
  let repository: PrismaOutboxRepository;
  let prisma: {
    eventOutbox: {
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  let module: TestingModule;

  beforeEach(async () => {
    prisma = {
      eventOutbox: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        PrismaOutboxRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaOutboxRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('save', () => {
    it('should create outbox entry with correct data', async () => {
      const event = new TestEvent('evt-1', 'user.registered', 'corr-1', Date.now(), { value: 'data' });

      await repository.save(event);

      expect(prisma.eventOutbox.create).toHaveBeenCalledWith({
        data: {
          id: 'evt-1',
          eventName: 'user.registered',
          payload: JSON.stringify({ value: 'data' }),
          status: 'PENDING',
          correlationId: 'corr-1',
          createdAt: expect.any(Number),
        },
      });
    });

    it('should propagate prisma errors', async () => {
      const event = new TestEvent('evt-2', 'test.event', 'corr-2', Date.now(), { value: 'data' });
      prisma.eventOutbox.create.mockRejectedValue(new Error('DB error'));

      await expect(repository.save(event)).rejects.toThrow('DB error');
    });
  });

  describe('findPending', () => {
    it('should return only pending entries older than cutoff', async () => {
      const now = Date.now();
      prisma.eventOutbox.findMany.mockResolvedValue([
        {
          id: 'evt-1',
          eventName: 'user.registered',
          payload: '{"eventId":"evt-1"}',
          status: 'PENDING',
          createdAt: BigInt(now - 10_000),
          publishedAt: null,
          error: null,
          retryCount: 0,
        },
      ]);

      const result = await repository.findPending(10, 5_000);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('PENDING');
      expect(prisma.eventOutbox.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
          createdAt: { lte: expect.any(Number) },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      });
    });

    it('should return empty when no pending entries', async () => {
      prisma.eventOutbox.findMany.mockResolvedValue([]);

      const result = await repository.findPending();

      expect(result).toEqual([]);
    });
  });

  describe('markPublished', () => {
    it('should update status to PUBLISHED with timestamp', async () => {
      await repository.markPublished('evt-1');

      expect(prisma.eventOutbox.update).toHaveBeenCalledWith({
        where: { id: 'evt-1', status: 'PENDING' },
        data: {
          status: 'PUBLISHED',
          publishedAt: expect.any(Number),
        },
      });
    });
  });

  describe('markFailed', () => {
    it('should update status to FAILED with error and increment retry', async () => {
      await repository.markFailed('evt-1', 'Delivery failed');

      expect(prisma.eventOutbox.update).toHaveBeenCalledWith({
        where: { id: 'evt-1', status: 'PENDING' },
        data: {
          status: 'FAILED',
          error: 'Delivery failed',
          retryCount: { increment: 1 },
        },
      });
    });
  });

  describe('incrementRetry', () => {
    it('should increment retryCount', async () => {
      await repository.incrementRetry('evt-1');

      expect(prisma.eventOutbox.update).toHaveBeenCalledWith({
        where: { id: 'evt-1', status: 'PENDING' },
        data: {
          retryCount: { increment: 1 },
        },
      });
    });
  });

  describe('deletePublished', () => {
    it('should delete published entries older than cutoff', async () => {
      prisma.eventOutbox.deleteMany.mockResolvedValue({ count: 3 });

      const result = await repository.deletePublished(86_400_000); // 24h

      expect(result).toBe(3);
      expect(prisma.eventOutbox.deleteMany).toHaveBeenCalledWith({
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: expect.any(Number) },
        },
      });
    });
  });
});
