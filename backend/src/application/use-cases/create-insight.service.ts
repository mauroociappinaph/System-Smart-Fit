import { Injectable, Inject } from '@nestjs/common';
import { CreateInsightUseCase } from '../ports/in/create-insight.use-case';
import { CreateInsightCommand } from '../ports/in/create-insight.command';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

@Injectable()
export class CreateInsightService implements CreateInsightUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
  ) {}

  async execute(
    command: CreateInsightCommand,
  ): Promise<{ entityId: string; event: import('../../domain/events/insight-generated.event').InsightGenerated }> {
    // 1. Domain Logic: Create Entity and Event via Factory
    const { entity, event } = AgentInsight.create(
      command.userId,
      command.correlationId,
      command.category,
      command.content,
      command.score,
      {
        insightId: command.insightId,
        eventId: command.eventId,
      },
    );

    // 2. Persistence: Save Entity via Output Port
    await this.agentInsightRepository.save(entity);

    // 3. (Pending) Publish Domain Event via EventBus Port
    // await this.eventBus.publish(event);

    return { entityId: entity.id, event };
  }
}
