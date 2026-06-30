import { randomUUID } from 'crypto';
import { Injectable, Inject } from '@nestjs/common';
import { GENERATE_INSIGHTS_PORT } from '../ports/out/generate-insights.port';
import type { GenerateInsightsPort } from '../ports/out/generate-insights.port';
import type { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';
import { HealthDataContext } from '../dto/health-data-context.dto';
import { InsightGenerated } from '../../domain/events/insight-generated.event';

export interface GenerateAndPersistInsightsCommand {
  userId: string;
  correlationId?: string;
  telemetryId?: string;
  userState?: string;
}

@Injectable()
export class GenerateAndPersistInsightsUseCase {
  constructor(
    @Inject(GENERATE_INSIGHTS_PORT)
    private readonly generateInsightsPort: GenerateInsightsPort,
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: GenerateAndPersistInsightsCommand): Promise<{
    insights: AgentInsight[];
    events: import('../../domain/events/insight-generated.event').InsightGenerated[];
  }> {
    const correlationId = command.correlationId || randomUUID();

    // 1. Build health data context
    const context: HealthDataContext = {
      userId: command.userId,
      recentTelemetry: [], // Will be populated by the adapter if needed
      userState: command.userState,
    };

    // 2. Generate insights via LLM adapter
    const generatedInsights = await this.generateInsightsPort.generateInsights(
      command.userId,
      correlationId,
      command.telemetryId,
      context,
    );

    if (generatedInsights.length === 0) {
      return { insights: [], events: [] };
    }

    // 3. Persist all insights in transaction
    const events: InsightGenerated[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const insight of generatedInsights) {
        await this.agentInsightRepository.save(insight, tx);
        const event = new InsightGenerated(
          randomUUID(),
          correlationId,
          Date.now(),
          {
            userId: insight.userId,
            insightId: insight.id,
            category: insight.category,
            content: insight.content,
            score: insight.score,
            correlationId,
          },
        );
        await this.outboxRepository.save(event, tx);
        events.push(event);
      }
    });

    return { insights: generatedInsights, events };
  }
}
