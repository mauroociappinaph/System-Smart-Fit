import { GetUserInsightsService } from './get-user-insights.service';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight, ValidationStatus } from '../../domain/entities/agent-insight.entity';

describe('GetUserInsightsService', () => {
  let service: GetUserInsightsService;
  let mockRepo: jest.Mocked<AgentInsightRepository>;

  function makeInsight(id: string): AgentInsight {
    return AgentInsight.reconstitute(
      id,
      'user-1',
      'corr-1',
      'nutrition',
      'Some insight',
      0.75,
      ValidationStatus.PENDING,
      Date.now(),
      Date.now(),
    );
  }

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countByUserId: jest.fn(),
    };
    service = new GetUserInsightsService(mockRepo);
  });

  it('should return paginated insights', async () => {
    const insights = [makeInsight('i-1'), makeInsight('i-2')];
    mockRepo.findByUserId.mockResolvedValue(insights);
    mockRepo.countByUserId.mockResolvedValue(2);

    const result = await service.execute('user-1', { limit: 10, offset: 0 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', { limit: 10, offset: 0 });
    expect(mockRepo.countByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return empty list when no insights exist', async () => {
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    const result = await service.execute('user-1');

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
