import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserUseCase } from '../ports/in/create-user.use-case';
import type { CreateUserCommand } from '../ports/in/create-user.command';
import type { UserRepository } from '../ports/out/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';

@Injectable()
export class CreateUserService implements CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ userId: string }> {
    const eventId = randomUUID();
    const registeredAt = Date.now();

    const { entity, event } = User.register(
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

    await this.prisma.$transaction(async (tx) => {
      await this.userRepository.save(entity, tx);
      await this.outboxRepository.save(event, tx);
    });

    return { userId: command.userId };
  }
}
