import { UserStateTransitioned } from '../events/user-state-transitioned.event';

export enum UserStateEnum {
  IDLE = 'IDLE',
  ACTIVE_TRACKING = 'ACTIVE_TRACKING',
  IMPROVEMENT = 'IMPROVEMENT',
  STAGNATION = 'STAGNATION',
  RISK = 'RISK',
  RECOVERY = 'RECOVERY',
}

/**
 * Valid FSM transitions per planCompleto.md §2.2
 */
const VALID_TRANSITIONS: Record<UserStateEnum, UserStateEnum[]> = {
  [UserStateEnum.IDLE]: [UserStateEnum.ACTIVE_TRACKING],
  [UserStateEnum.ACTIVE_TRACKING]: [
    UserStateEnum.IMPROVEMENT,
    UserStateEnum.STAGNATION,
    UserStateEnum.RISK,
  ],
  [UserStateEnum.IMPROVEMENT]: [UserStateEnum.RECOVERY],
  [UserStateEnum.STAGNATION]: [
    UserStateEnum.IMPROVEMENT,
    UserStateEnum.RECOVERY,
  ],
  [UserStateEnum.RISK]: [UserStateEnum.RECOVERY],
  [UserStateEnum.RECOVERY]: [UserStateEnum.ACTIVE_TRACKING],
};

export class UserState {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _currentState: UserStateEnum,
    private readonly _previousState: UserStateEnum | null,
    private readonly _transitionedAt: number,
    private readonly _correlationId: string,
  ) {}

  public get id(): string { return this._id; }
  public get userId(): string { return this._userId; }
  public get currentState(): UserStateEnum { return this._currentState; }
  public get previousState(): UserStateEnum | null { return this._previousState; }
  public get transitionedAt(): number { return this._transitionedAt; }
  public get correlationId(): string { return this._correlationId; }

  /**
   * Factory method — creates a new UserState transition and its domain event.
   * Enforces FSM transition rules.
   */
  public static transition(
    id: string,
    eventId: string,
    userId: string,
    currentState: UserStateEnum,
    previousState: UserStateEnum | null,
    transitionedAt: number,
    correlationId: string,
  ): { entity: UserState; event: UserStateTransitioned } {
    // Guard: validate transition rules
    if (previousState !== null) {
      const allowed = VALID_TRANSITIONS[previousState] ?? [];
      if (!allowed.includes(currentState)) {
        throw new Error(
          `UserState: invalid transition from ${previousState} to ${currentState}`,
        );
      }
    } else if (currentState !== UserStateEnum.IDLE) {
      // Initial state must be IDLE
      throw new Error(
        `UserState: initial state must be IDLE, got ${currentState}`,
      );
    }

    const entity = new UserState(
      id,
      userId,
      currentState,
      previousState,
      transitionedAt,
      correlationId,
    );

    const event = new UserStateTransitioned(
      eventId,
      correlationId,
      transitionedAt,
      {
        userId,
        currentState,
        previousState,
        transitionedAt,
      },
    );

    return { entity, event };
  }

  /**
   * Reconstitute a UserState from persisted data (bypasses FSM validation).
   * Intended for repository adapters only.
   */
  public static reconstitute(
    id: string,
    userId: string,
    currentState: UserStateEnum,
    previousState: UserStateEnum | null,
    transitionedAt: number,
    correlationId: string,
  ): UserState {
    return new UserState(id, userId, currentState, previousState, transitionedAt, correlationId);
  }

  /**
   * Check if a transition to the given state is valid from current state
   */
  public canTransitionTo(targetState: UserStateEnum): boolean {
    const allowed = VALID_TRANSITIONS[this._currentState] ?? [];
    return allowed.includes(targetState);
  }

  /**
   * Get all valid next states from current state
   */
  public getValidNextStates(): UserStateEnum[] {
    return VALID_TRANSITIONS[this._currentState] ?? [];
  }
}