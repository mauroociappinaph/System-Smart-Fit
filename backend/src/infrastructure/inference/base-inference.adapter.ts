import { Injectable, Logger } from '@nestjs/common';
import { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import type { HealthDataContext } from '../../application/dto/health-data-context.dto';
import { sanitizePromptInput } from '../utils/prompt-sanitizer.util';

export abstract class BaseInferenceAdapter implements GenerateInsightsPort {
  protected readonly logger = new Logger(this.constructor.name);

  abstract generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
    context?: HealthDataContext,
  ): Promise<AgentInsight[]>;

  async validateInsight(_insightId: string, _action: string): Promise<void> {
    this.logger.warn(
      `${this.constructor.name}.validateInsight is not implemented (stub)`,
    );
  }

  protected buildPrompt(context?: HealthDataContext): string {
    if (!context || context.recentTelemetry.length === 0) {
      return 'El usuario no tiene datos biométricos recientes. Generá un insight motivacional general para empezar su viaje fitness.';
    }

    const metrics = context.recentTelemetry
      .map(
        (t) =>
          `- ${sanitizePromptInput(t.metricType)}: ${sanitizePromptInput(String(t.value))} ${sanitizePromptInput(t.unit)} (${new Date(t.recordedAt).toLocaleDateString()})`,
      )
      .join('\n');

    const userState = context.userState
      ? `Estado actual: ${sanitizePromptInput(context.userState)}`
      : '';

    return `Datos biométricos recientes del usuario:

${metrics}

${userState}

Generá insights personalizados de fitness y salud basados en estos datos.`;
  }

  protected parseInsights(
    raw: string,
    userId: string,
    correlationId: string,
  ): AgentInsight[] {
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : (parsed.insights ?? []);

      return items.map((item: Record<string, unknown>) => {
        const rawScore = Number(item.score ?? 50);
        const clampedScore = Math.min(100, Math.max(0, rawScore));
        const { entity } = AgentInsight.create(
          userId,
          correlationId,
          String(item.category ?? 'general'),
          String(item.content ?? ''),
          clampedScore,
        );
        return entity;
      });
    } catch {
      this.logger.warn(`Failed to parse response as JSON, returning empty`);
      return [];
    }
  }
}
