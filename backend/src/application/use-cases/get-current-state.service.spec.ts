import { GetCurrentStateService } from './get-current-state.service';
import { UserStateRepository } from '../ports/out/user-state.repository';
import { UserState, UserStateEnum } from '../../domain/entities/user-state.entity';

describe('GetCurrentStateService', () => {
  let service: GetCurrentStateService;
  let mockRepo: jest.Mocked<UserStateRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findCurrentByUserId: jest.fn(),
      findHistoryByUserId: jest.fn(),
      countHistoryByUserId: jest.fn(),
    };
    service = new GetCurrentStateService(mockRepo);
  });

  it('should return current state when user has one', async () => {
    const { entity } = UserState.transition(
      'id-1', 'evt-1', 'user-1',
      UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IDLE,
      Date.now(), 'corr-1',
    );

    mockRepo.findCurrentByUserId.mockResolvedValue(entity);

    const result = await service.execute('user-1');

    expect(result).not.toBeNull();
    expect(result!.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
    expect(result!.userId).toBe('user-1');
  });

  it('should return null when user has no state', async () => {
    mockRepo.findCurrentByUserId.mockResolvedValue(null);

    const result = await service.execute('user-1');

    expect(result).toBeNull();
  });
});
