import { UserState, UserStateEnum } from './user-state.entity';

describe('UserState Entity', () => {
  const baseId = 'state-1';
  const baseEventId = 'event-1';
  const baseUserId = 'user-1';
  const baseTransitionedAt = Date.now();
  const baseCorrelationId = 'corr-1';

  function makeTransition(
    currentState: UserStateEnum,
    previousState: UserStateEnum | null,
    overrides?: { id?: string; eventId?: string; userId?: string; transitionedAt?: number; correlationId?: string },
  ) {
    return UserState.transition(
      overrides?.id ?? baseId,
      overrides?.eventId ?? baseEventId,
      overrides?.userId ?? baseUserId,
      currentState,
      previousState,
      overrides?.transitionedAt ?? baseTransitionedAt,
      overrides?.correlationId ?? baseCorrelationId,
    );
  }

  describe('Initial state (IDLE)', () => {
    it('should create initial IDLE state with null previousState', () => {
      const { entity } = makeTransition(UserStateEnum.IDLE, null);

      expect(entity.currentState).toBe(UserStateEnum.IDLE);
      expect(entity.previousState).toBeNull();
    });

    it('should reject initial state other than IDLE', () => {
      expect(() => makeTransition(UserStateEnum.ACTIVE_TRACKING, null)).toThrow(
        'initial state must be IDLE',
      );
    });
  });

  describe('Valid transitions', () => {
    it('IDLE → ACTIVE_TRACKING', () => {
      const { entity } = makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IDLE);
      expect(entity.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
      expect(entity.previousState).toBe(UserStateEnum.IDLE);
    });

    it('ACTIVE_TRACKING → IMPROVEMENT', () => {
      const { entity } = makeTransition(UserStateEnum.IMPROVEMENT, UserStateEnum.ACTIVE_TRACKING);
      expect(entity.currentState).toBe(UserStateEnum.IMPROVEMENT);
    });

    it('ACTIVE_TRACKING → STAGNATION', () => {
      const { entity } = makeTransition(UserStateEnum.STAGNATION, UserStateEnum.ACTIVE_TRACKING);
      expect(entity.currentState).toBe(UserStateEnum.STAGNATION);
    });

    it('ACTIVE_TRACKING → RISK', () => {
      const { entity } = makeTransition(UserStateEnum.RISK, UserStateEnum.ACTIVE_TRACKING);
      expect(entity.currentState).toBe(UserStateEnum.RISK);
    });

    it('IMPROVEMENT → RECOVERY', () => {
      const { entity } = makeTransition(UserStateEnum.RECOVERY, UserStateEnum.IMPROVEMENT);
      expect(entity.currentState).toBe(UserStateEnum.RECOVERY);
    });

    it('STAGNATION → IMPROVEMENT', () => {
      const { entity } = makeTransition(UserStateEnum.IMPROVEMENT, UserStateEnum.STAGNATION);
      expect(entity.currentState).toBe(UserStateEnum.IMPROVEMENT);
    });

    it('STAGNATION → RECOVERY', () => {
      const { entity } = makeTransition(UserStateEnum.RECOVERY, UserStateEnum.STAGNATION);
      expect(entity.currentState).toBe(UserStateEnum.RECOVERY);
    });

    it('RISK → RECOVERY', () => {
      const { entity } = makeTransition(UserStateEnum.RECOVERY, UserStateEnum.RISK);
      expect(entity.currentState).toBe(UserStateEnum.RECOVERY);
    });

    it('RECOVERY → ACTIVE_TRACKING', () => {
      const { entity } = makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.RECOVERY);
      expect(entity.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
    });
  });

  describe('Invalid transitions', () => {
    it('should reject ACTIVE_TRACKING → IDLE', () => {
      expect(() =>
        makeTransition(UserStateEnum.IDLE, UserStateEnum.ACTIVE_TRACKING),
      ).toThrow('invalid transition');
    });

    it('should reject IMPROVEMENT → ACTIVE_TRACKING', () => {
      expect(() =>
        makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IMPROVEMENT),
      ).toThrow('invalid transition');
    });

    it('should reject RISK → STAGNATION', () => {
      expect(() =>
        makeTransition(UserStateEnum.STAGNATION, UserStateEnum.RISK),
      ).toThrow('invalid transition');
    });

    it('should reject RECOVERY → IMPROVEMENT', () => {
      expect(() =>
        makeTransition(UserStateEnum.IMPROVEMENT, UserStateEnum.RECOVERY),
      ).toThrow('invalid transition');
    });
  });

  describe('canTransitionTo', () => {
    it('should return true for valid next states', () => {
      const { entity } = makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IDLE);
      expect(entity.canTransitionTo(UserStateEnum.IMPROVEMENT)).toBe(true);
      expect(entity.canTransitionTo(UserStateEnum.STAGNATION)).toBe(true);
      expect(entity.canTransitionTo(UserStateEnum.RISK)).toBe(true);
    });

    it('should return false for invalid next states', () => {
      const { entity } = makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IDLE);
      expect(entity.canTransitionTo(UserStateEnum.IDLE)).toBe(false);
      expect(entity.canTransitionTo(UserStateEnum.RECOVERY)).toBe(false);
    });
  });

  describe('getValidNextStates', () => {
    it('should return correct valid next states for ACTIVE_TRACKING', () => {
      const { entity } = makeTransition(UserStateEnum.ACTIVE_TRACKING, UserStateEnum.IDLE);
      const valid = entity.getValidNextStates();
      expect(valid).toContain(UserStateEnum.IMPROVEMENT);
      expect(valid).toContain(UserStateEnum.STAGNATION);
      expect(valid).toContain(UserStateEnum.RISK);
      expect(valid.length).toBe(3);
    });

    it('should return [ACTIVE_TRACKING] for RECOVERY (only transition)', () => {
      const { entity } = makeTransition(UserStateEnum.RECOVERY, UserStateEnum.RISK);
      const valid = entity.getValidNextStates();
      expect(valid).toEqual([UserStateEnum.ACTIVE_TRACKING]);
    });
  });

  describe('Domain Event', () => {
    it('should emit UserStateTransitioned event with correct payload', () => {
      const { entity, event } = makeTransition(
        UserStateEnum.ACTIVE_TRACKING,
        UserStateEnum.IDLE,
      );

      expect(event.eventName).toBe('user_state.transitioned');
      expect(event.version).toBe('v1');
      expect(event.correlationId).toBe(baseCorrelationId);
      expect(event.payload.userId).toBe(baseUserId);
      expect(event.payload.currentState).toBe(UserStateEnum.ACTIVE_TRACKING);
      expect(event.payload.previousState).toBe(UserStateEnum.IDLE);
      expect(event.payload.transitionedAt).toBe(baseTransitionedAt);
    });
  });
});
