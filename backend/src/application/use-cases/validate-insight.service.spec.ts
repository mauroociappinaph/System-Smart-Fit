import { NotFoundException } from '@nestjs/common';
import { ValidateInsightService } from './validate-insight.service';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight, ValidationStatus } from '../../domain/entities/agent-insight.entity';

describe('ValidateInsightService', () => {
  let service: ValidateInsightService;
  let mockRepo: jest.Mocked<AgentInsightRepository>;

  function makePendingInsight(): AgentInsight {
    return AgentInsight.reconstitute(
      'insight-1',
      'user-1',
      'corr-1',
      'nutrition',
      'Eat more protein',
      0.85,
      ValidationStatus.PENDING,
      Date.now(),
      Date.now(),
    );
  }

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countByUserId: jest.fn(),
    };
    service = new ValidateInsightService(mockRepo);
  });

  it('should approve a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'approve');

    expect(result.validationStatus).toBe(ValidationStatus.APPROVED);
    expect(mockRepo.save).toHaveBeenCalledWith(result);
  });

  it('should reject a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'reject');

    expect(result.validationStatus).toBe(ValidationStatus.REJECTED);
    expect(mockRepo.save).toHaveBeenCalledWith(result);
  });

  it('should discard a pending insight', async () => {
    const insight = makePendingInsight();
    mockRepo.findById.mockResolvedValue(insight);

    const result = await service.execute('insight-1', 'discard');

    expect(result.validationStatus).toBe(ValidationStatus.DISCARDED);
    expect(mockRepo.save).toHaveBeenCalledWith(result);
  });

  it('should throw when insight is not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.execute('nonexistent', 'approve')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should throw when insight is not in PENDING status', async () => {
    const insight = AgentInsight.reconstitute(
      'insight-1',
      'user-1',
      'corr-1',
      'nutrition',
      'Eat more protein',
      0.85,
      ValidationStatus.APPROVED,
      Date.now(),
      Date.now(),
    );
    mockRepo.findById.mockResolvedValue(insight);

    await expect(service.execute('insight-1', 'approve')).rejects.toThrow(
      'insight is not in PENDING status',
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
