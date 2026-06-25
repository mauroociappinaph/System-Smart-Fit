import { DomainEvent } from '../../shared/domain/domain-event.interface';
import { UserGoal } from '../entities/user.entity';

export interface UserRegisteredPayload {
  readonly name: string;
  readonly weightKg: number;
  readonly heightCm: number;
  readonly birthDate: number;
  readonly goal: UserGoal;
}

export class UserRegistered implements DomainEvent<UserRegisteredPayload> {
  public readonly eventName = 'user.registered';
  public readonly version = 'v1';

  constructor(
    public readonly eventId: string,
    public readonly correlationId: string,
    public readonly occurredOn: number,
    public readonly payload: UserRegisteredPayload,
  ) {}
}
