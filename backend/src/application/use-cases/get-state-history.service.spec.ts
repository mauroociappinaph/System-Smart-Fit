import { GetStateHistoryService } from './get-state-history.service';
import { UserStateRepository } from '../ports/out/user-state.repository';
import {
  UserState,
  UserStateEnum,
} from '../../domain/entities/user-state.entity';

describe('GetStateHistoryService', () => {
  let service: GetStateHistoryService;
  let mockRepo: jest.Mocked<UserStateRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findCurrentByUserId: jest.fn(),
      findHistoryByUserId: jest.fn(),
      countHistoryByUserId: jest.fn(),
    };
    service = new GetStateHistoryService(mockRepo);
  });

  it('should return paginated history', async () => {
    const transitionedAt = Date.now();
    const { entity } = UserState.transition(
      'id-1',
      'evt-1',
      'user-1',
      UserStateEnum.IDLE,
      null,
      null,
      transitionedAt,
      'corr-1',
    );

    mockRepo.findHistoryByUserId.mockResolvedValue([entity]);
    mockRepo.countHistoryByUserId.mockResolvedValue(1);

    const result = await service.execute('user-1', { limit: 10, offset: 0 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockRepo.findHistoryByUserId).toHaveBeenCalledWith('user-1', {
      limit: 10,
      offset: 0,
    });
    expect(mockRepo.countHistoryByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return empty history when no states exist', async () => {
    mockRepo.findHistoryByUserId.mockResolvedValue([]);
    mockRepo.countHistoryByUserId.mockResolvedValue(0);

    const result = await service.execute('user-1');

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
