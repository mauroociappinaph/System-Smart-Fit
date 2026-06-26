import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserUseCase } from '../ports/in/create-user.use-case';
import { CreateUserCommand } from '../ports/in/create-user.command';
import { UserRepository } from '../ports/out/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserService implements CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ userId: string }> {
    const eventId = randomUUID();
    const registeredAt = Date.now();

    const { entity } = User.register(
      command.userId,
      eventId,
      command.name,
      command.weightKg,
      command.heightCm,
      command.birthDate,
      command.goal,
      command.role,
      registeredAt,
    );

    await this.userRepository.save(entity);

    return { userId: command.userId };
  }
}
