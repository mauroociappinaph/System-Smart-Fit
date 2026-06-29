import { ValidateInsightService } from './validate-insight.service';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import {
  AgentInsight,
  ValidationStatus,
} from '../../domain/entities/agent-insight.entity';
import { AgentInsightNotFoundError } from '../../shared/domain/error/agent-insight-not-found.error';
import { InsightNotPendingError } from '../../shared/domain/error/insight-not-pending.error';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';

describe('ValidateInsightService', () => {
  let service: ValidateInsightService;
  let mockRepo: jest.Mocked<AgentInsightRepository>;
  let mockOutbox: jest.Mocked<OutboxRepositoryPort>;
  let mockPrisma: { $transaction: jest.Mock };

  function makePendingInsight(): AgentInsight {
    return AgentInsight.reconstitute({
      id: 'insight-1',
      userId: 'user-1',
      correlationId: 'corr-1',
      category: 'nutrition',
      content: 'Eat more protein',
      score: 0.85,
      validationStatus: ValidationStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countByUserId: jest.fn(),
    };
    mockOutbox = {
      save: jest.fn().mockResolvedValue(undefined),
      findPending: jest.fn(),
      markPublished: jest.fn(),
      markFailed: jest.fn(),
      incrementRetry: jest.fn(),
      deletePublished: jest.fn(),
    };
    mockPrisma = {
      $transaction: jest.fn((cb: (tx: any) => Promise<void>) => cb({})),
    };
    service = new ValidateInsightService(
      mockRepo,
      mockOutbox,
      mockPrisma as any,
    );
  });

  it('should approve a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'approve');

    expect(result.validationStatus).toBe(ValidationStatus.APPROVED);
    expect(mockRepo.save).toHaveBeenCalledWith(result, expect.any(Object));
    expect(mockOutbox.save).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('should reject a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'reject');

    expect(result.validationStatus).toBe(ValidationStatus.REJECTED);
    expect(mockRepo.save).toHaveBeenCalledWith(result, expect.any(Object));
    expect(mockOutbox.save).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('should discard a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'discard');

    expect(result.validationStatus).toBe(ValidationStatus.DISCARDED);
    expect(mockRepo.save).toHaveBeenCalledWith(result, expect.any(Object));
    expect(mockOutbox.save).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('should throw when insight is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.execute('nonexistent', 'approve')).rejects.toThrow(
      AgentInsightNotFoundError,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw when insight is not in PENDING status', async () => {
    const insight = AgentInsight.reconstitute({
      id: 'insight-1',
      userId: 'user-1',
      correlationId: 'corr-1',
      category: 'nutrition',
      content: 'Eat more protein',
      score: 0.85,
      validationStatus: ValidationStatus.APPROVED,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    mockRepo.findById.mockResolvedValue(insight);

    await expect(service.execute('insight-1', 'approve')).rejects.toThrow(
      InsightNotPendingError,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
