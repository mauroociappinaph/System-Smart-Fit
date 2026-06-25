import { CreateUserCommand } from './create-user.command';

export interface CreateUserUseCase {
  execute(command: CreateUserCommand): Promise<{ userId: string }>;
}
