import { UserGoal, UserRole } from '../../../domain/entities/user.entity';

export interface CreateUserCommand {
  readonly userId: string;
  readonly name: string;
  readonly weightKg: number;
  readonly heightCm: number;
  readonly birthDate: number;
  readonly goal: UserGoal;
  readonly role: UserRole;
}
