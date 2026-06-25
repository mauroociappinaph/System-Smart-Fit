import { DomainEvent } from '../../shared/domain/domain-event.interface';

export interface UserStateTransitionedPayload {
  readonly userId: string;
  readonly currentState: string;
  readonly previousState: string | null;
  readonly transitionedAt: number;
}

export class UserStateTransitioned implements DomainEvent<UserStateTransitionedPayload> {
  public readonly eventName = 'user_state.transitioned';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: UserStateTransitionedPayload,
  ) {}
}