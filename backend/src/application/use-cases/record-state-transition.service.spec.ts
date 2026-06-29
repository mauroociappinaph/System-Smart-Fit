import { RecordStateTransitionService } from './record-state-transition.service';
import { UserStateRepository } from '../ports/out/user-state.repository';
import { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { UserStateEnum } from '../../domain/entities/user-state.entity';

describe('RecordStateTransitionService', () => {
  let service: RecordStateTransitionService;
  let mockRepo: jest.Mocked<UserStateRepository>;
  let mockOutbox: jest.Mocked<OutboxRepositoryPort>;
  let mockPrisma: { $transaction: jest.Mock };

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findCurrentByUserId: jest.fn(),
      findHistoryByUserId: jest.fn(),
      countHistoryByUserId: jest.fn(),
    };
    mockOutbox = {
      save: jest.fn().mockResolvedValue(undefined),
      findPending: jest.fn().mockResolvedValue([]),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
      incrementRetry: jest.fn().mockResolvedValue(undefined),
      deletePublished: jest.fn().mockResolvedValue(0),
    };
    mockPrisma = {
      $transaction: jest.fn((cb: (tx: any) => Promise<void>) => cb({})),
    };
    service = new RecordStateTransitionService(mockRepo, mockOutbox, mockPrisma as any);
  });

  it('should create IDLE state and save it', async () => {
    mockRepo.findCurrentByUserId.mockResolvedValue(null);

    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.IDLE,
      previousState: null,
    });

    expect(result.entityId).toBeDefined();
    expect(result.event.eventName).toBe('user_state.transitioned');
    expect(result.event.payload.currentState).toBe(UserStateEnum.IDLE);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });

  it('should create ACTIVE_TRACKING from IDLE and save it', async () => {
    mockRepo.findCurrentByUserId.mockResolvedValue({ currentState: UserStateEnum.IDLE } as any);

    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.ACTIVE_TRACKING,
      previousState: UserStateEnum.IDLE,
    });

    expect(result.entityId).toBeDefined();
    expect(result.event.payload.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
    expect(result.event.payload.previousState).toBe(UserStateEnum.IDLE);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });

  it('should reject state transition without prior IDLE record', async () => {
    mockRepo.findCurrentByUserId.mockResolvedValue(null);

    await expect(
      service.execute({
        userId: 'user-1',
        currentState: UserStateEnum.ACTIVE_TRACKING,
        previousState: UserStateEnum.IDLE,
      }),
    ).rejects.toThrow('previousState "IDLE" does not match latest record state "null"');

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should reject invalid transition', async () => {
    mockRepo.findCurrentByUserId.mockResolvedValue({ currentState: UserStateEnum.ACTIVE_TRACKING } as any);

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
    mockRepo.findCurrentByUserId.mockResolvedValue(null);

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
    mockRepo.findCurrentByUserId.mockResolvedValue({ currentState: UserStateEnum.IDLE } as any);

    const result = await service.execute({
      userId: 'user-1',
      currentState: UserStateEnum.ACTIVE_TRACKING,
      previousState: UserStateEnum.IDLE,
      correlationId: 'my-corr',
    });

    expect(result.event.correlationId).toBe('my-corr');
  });
});
