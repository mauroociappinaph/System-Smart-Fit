import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import {
  ValidateInsightUseCase,
  ValidationAction,
} from '../ports/in/validate-insight.use-case';
import type { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import { InsightValidated } from '../../domain/events/insight-validated.event';
import { AgentInsightNotFoundError } from '../../shared/domain/error/agent-insight-not-found.error';
import { InsightNotPendingError } from '../../shared/domain/error/insight-not-pending.error';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ValidateInsightService implements ValidateInsightUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    insightId: string,
    action: ValidationAction,
  ): Promise<AgentInsight> {
    const insight = await this.agentInsightRepository.findById(insightId);

    if (!insight) {
      throw new AgentInsightNotFoundError(insightId);
    }

    try {
      switch (action) {
        case 'approve':
          insight.approve();
          break;
        case 'reject':
          insight.reject();
          break;
        case 'discard':
          insight.discard();
          break;
      }
    } catch (error) {
      if (error instanceof InsightNotPendingError) {
        throw error;
      }
      throw error;
    }

    const event = new InsightValidated(
      randomUUID(),
      insight.correlationId,
      Date.now(),
      {
        insightId: insight.id,
        userId: insight.userId,
        validationStatus: insight.validationStatus,
        action,
      },
    );

    await this.prisma.$transaction(async (tx) => {
      await this.agentInsightRepository.save(insight, tx);
      await this.outboxRepository.save(event, tx);
    });

    return insight;
  }
}
