import { DomainEvent } from '../../shared/domain/domain-event.interface';
import { UserGoal, UserRole } from '../entities/user.entity';

export interface UserRegisteredPayload {
  readonly name: string;
  readonly weightKg: number;
  readonly heightCm: number;
  readonly birthDate: number;
  readonly goal: UserGoal;
  readonly role: UserRole;
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
