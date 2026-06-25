import { RecordStateTransitionService } from './record-state-transition.service';
import { UserStateRepository } from '../ports/out/user-state.repository';
import { UserStateEnum } from '../../domain/entities/user-state.entity';

describe('RecordStateTransitionService', () => {
  let service: RecordStateTransitionService;
  let mockRepo: jest.Mocked<UserStateRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findCurrentByUserId: jest.fn(),
      findHistoryByUserId: jest.fn(),
      countHistoryByUserId: jest.fn(),
    };
    service = new RecordStateTransitionService(mockRepo);
  });

  it('should create IDLE state and save it', async () => {
    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.IDLE,
      previousState: null,
    });

    expect(result.entityId).toBeDefined();
    expect(result.event.eventName).toBe('user_state.transitioned');
    expect(result.event.payload.currentState).toBe(UserStateEnum.IDLE);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should create ACTIVE_TRACKING from IDLE and save it', async () => {
    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.ACTIVE_TRACKING,
      previousState: UserStateEnum.IDLE,
    });

    expect(result.entityId).toBeDefined();
    expect(result.event.payload.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
    expect(result.event.payload.previousState).toBe(UserStateEnum.IDLE);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid transition', async () => {
    await expect(
      service.execute({
        userId: 'user-1',
        currentState: UserStateEnum.IDLE,
        previousState: UserStateEnum.ACTIVE_TRACKING,
      }),
    ).rejects.toThrow('invalid transition');

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should reject initial state other than IDLE', async () => {
    await expect(
      service.execute({
        userId: 'user-1',
        currentState: UserStateEnum.RISK,
        previousState: null,
      }),
    ).rejects.toThrow('initial state must be IDLE');

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should use provided correlationId', async () => {
    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.ACTIVE_TRACKING,
      previousState: UserStateEnum.IDLE,
      correlationId: 'my-corr',
    });

    expect(result.event.correlationId).toBe('my-corr');
  });
});
