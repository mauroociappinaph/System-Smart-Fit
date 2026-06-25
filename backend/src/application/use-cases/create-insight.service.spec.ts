import { CreateInsightService } from './create-insight.service';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';

describe('CreateInsightService', () => {
  let service: CreateInsightService;
  let mockRepo: jest.Mocked<AgentInsightRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      countByUserId: jest.fn(),
    };
    service = new CreateInsightService(mockRepo);
  });

  it('should create an insight and save it', async () => {
    const result = await service.execute({
      userId: 'user-1',
      correlationId: 'corr-1',
      category: 'nutrition',
      content: 'User should increase protein intake',
      score: 0.85,
    });

    expect(result.entityId).toBeDefined();
    expect(result.event.eventName).toBe('agent_insight.generated');
    expect(result.event.correlationId).toBe('corr-1');
    expect(result.event.payload.userId).toBe('user-1');
    expect(result.event.payload.category).toBe('nutrition');
    expect(result.event.payload.content).toBe('User should increase protein intake');
    expect(result.event.payload.score).toBe(0.85);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should use provided insightId and eventId', async () => {
    const result = await service.execute({
      userId: 'user-1',
      correlationId: 'corr-1',
      category: 'exercise',
      content: 'Consider rest days',
      score: 0.92,
      insightId: 'insight-fixed',
      eventId: 'event-fixed',
    });

    expect(result.entityId).toBe('insight-fixed');
    expect(result.event.eventId).toBe('event-fixed');
    expect(result.event.payload.insightId).toBe('insight-fixed');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
