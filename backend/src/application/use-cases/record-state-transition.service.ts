import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { RecordStateTransitionUseCase } from '../ports/in/record-state-transition.use-case';
import type { RecordStateTransitionCommand } from '../ports/in/record-state-transition.command';
import type { UserStateRepository } from '../ports/out/user-state.repository';
import { UserState, UserStateEnum } from '../../domain/entities/user-state.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';

@Injectable()
export class RecordStateTransitionService implements RecordStateTransitionUseCase {
  constructor(
    @Inject('UserStateRepository')
    private readonly userStateRepository: UserStateRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: RecordStateTransitionCommand,
  ): Promise<{ entityId: string; event: import('../../domain/events/user-state-transitioned.event').UserStateTransitioned }> {
    const id = randomUUID();
    const eventId = randomUUID();
    const correlationId = command.correlationId || randomUUID();
    const transitionedAt = Date.now();

    // 1. Fetch latest state for invariant check
    const latestRecord = await this.userStateRepository.findCurrentByUserId(command.userId);
    const latestCurrentState = latestRecord?.currentState ?? null;

    // 2. Domain Logic: Create Entity and Event via Factory
    const { entity, event } = UserState.transition(
      id,
      eventId,
      command.userId,
      command.currentState,
      command.previousState,
      latestCurrentState,
      transitionedAt,
      correlationId,
    );

    // 2. Persistence: Save Entity + Outbox Event in Transaction
    await this.prisma.$transaction(async (tx) => {
      await this.userStateRepository.save(entity, tx);
      await this.outboxRepository.save(event, tx);
    });

    return { entityId: entity.id, event };
  }
}
