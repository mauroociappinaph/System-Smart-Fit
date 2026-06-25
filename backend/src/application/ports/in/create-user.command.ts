import { UserGoal } from '../../../domain/entities/user.entity';

export interface CreateUserCommand {
  readonly name: string;
  readonly weightKg: number;
  readonly heightCm: number;
  readonly birthDate: number;
  readonly goal: UserGoal;
}
