import { GetUserInsightsService } from './get-user-insights.service';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight, ValidationStatus } from '../../domain/entities/agent-insight.entity';

describe('GetUserInsightsService', () => {
  let service: GetUserInsightsService;
  let mockRepo: jest.Mocked<AgentInsightRepository>;

  function makeInsight(id: string): AgentInsight {
    return AgentInsight.reconstitute({
      id,
      userId: 'user-1',
      correlationId: 'corr-1',
      category: 'nutrition',
      content: 'Some insight',
      score: 0.75,
      validationStatus: ValidationStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', { limit: 10, offset: 0, dateFilter: undefined });
    expect(mockRepo.countByUserId).toHaveBeenCalledWith('user-1', undefined);
  });

  it('should return empty list when no insights exist', async () => {
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    const result = await service.execute('user-1');

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  // ── C3 — month filter ─────────────────────────────────────

  it('should convert month to date range filter', async () => {
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    await service.execute('user-1', { month: 3 });

    const today = new Date();
    const year = today.getFullYear();
    const expectedStart = new Date(year, 2, 1).getTime();       // March 1
    const expectedEnd = new Date(year, 3, 0, 23, 59, 59, 999).getTime(); // March 31

    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', {
      limit: undefined,
      offset: undefined,
      dateFilter: { startDate: expectedStart, endDate: expectedEnd },
    });
    expect(mockRepo.countByUserId).toHaveBeenCalledWith('user-1', {
      startDate: expectedStart,
      endDate: expectedEnd,
    });
  });

  it('should pass startDate/endDate directly', async () => {
    const startDate = 1700000000000;
    const endDate = 1700100000000;
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    await service.execute('user-1', { startDate, endDate });

    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', {
      limit: undefined,
      offset: undefined,
      dateFilter: { startDate, endDate },
    });
    expect(mockRepo.countByUserId).toHaveBeenCalledWith('user-1', { startDate, endDate });
  });

  it('should allow only startDate without endDate', async () => {
    const startDate = 1700000000000;
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    await service.execute('user-1', { startDate });

    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', {
      limit: undefined,
      offset: undefined,
      dateFilter: { startDate, endDate: undefined },
    });
  });

  it('should allow only endDate without startDate', async () => {
    const endDate = 1700100000000;
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.countByUserId.mockResolvedValue(0);

    await service.execute('user-1', { endDate });

    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1', {
      limit: undefined,
      offset: undefined,
      dateFilter: { startDate: undefined, endDate },
    });
  });
});
