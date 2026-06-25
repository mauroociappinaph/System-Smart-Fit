import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { RecordStateTransitionUseCase } from '../ports/in/record-state-transition.use-case';
import { RecordStateTransitionCommand } from '../ports/in/record-state-transition.command';
import { UserStateRepository } from '../ports/out/user-state.repository';
import { UserState } from '../../domain/entities/user-state.entity';

@Injectable()
export class RecordStateTransitionService implements RecordStateTransitionUseCase {
  constructor(
    @Inject('UserStateRepository')
    private readonly userStateRepository: UserStateRepository,
  ) {}

  async execute(
    command: RecordStateTransitionCommand,
  ): Promise<{ entityId: string; event: import('../../domain/events/user-state-transitioned.event').UserStateTransitioned }> {
    const id = randomUUID();
    const eventId = randomUUID();
    const correlationId = command.correlationId || randomUUID();
    const transitionedAt = Date.now();

    // 1. Domain Logic: Create Entity and Event via Factory
    const { entity, event } = UserState.transition(
      id,
      eventId,
      command.userId,
      command.currentState,
      command.previousState,
      transitionedAt,
      correlationId,
    );

    // 2. Persistence: Save Entity via Output Port
    await this.userStateRepository.save(entity);

    // 3. (Pending) Publish Domain Event via EventBus Port
    // await this.eventBus.publish(event);

    return { entityId: entity.id, event };
  }
}
