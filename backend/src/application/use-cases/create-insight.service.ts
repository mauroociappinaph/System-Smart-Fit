import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { CreateInsightUseCase } from '../ports/in/create-insight.use-case';
import { CreateInsightCommand } from '../ports/in/create-insight.command';
import type { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';

@Injectable()
export class CreateInsightService implements CreateInsightUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateInsightCommand): Promise<{
    entityId: string;
    event: import('../../domain/events/insight-generated.event').InsightGenerated;
  }> {
    const correlationId = command.correlationId || randomUUID();

    // 1. Domain Logic: Create Entity and Event via Factory
    const { entity, event } = AgentInsight.create(
      command.userId,
      correlationId,
      command.category,
      command.content,
      command.score,
      {
        insightId: command.insightId,
        eventId: command.eventId,
      },
    );

    // 2. Persistence: Save Entity + Outbox Event in Transaction
    await this.prisma.$transaction(async (tx) => {
      await this.agentInsightRepository.save(entity, tx);
      await this.outboxRepository.save(event, tx);
    });

    return { entityId: entity.id, event };
  }
}
