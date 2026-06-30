import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import type { HealthDataContext } from '../../application/dto/health-data-context.dto';

@Injectable()
export class NIMAdapter implements GenerateInsightsPort {
  private readonly logger = new Logger(NIMAdapter.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxRetries = 2;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: this.configService.getOrThrow<string>('NIM_API_KEY'),
    });
    this.model =
      this.configService.get<string>('NIM_MODEL') ??
      'mistralai/mistral-7b-instruct-v0.3';
  }

  async generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
    context?: HealthDataContext,
  ): Promise<AgentInsight[]> {
    this.logger.log(
      `Generating insights for user ${userId} via NIM (${this.model})`,
    );

    const prompt = this.buildPrompt(context);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'Eres un entrenador personal de fitness y salud. Generas insights personalizados basados en datos biométricos del usuario. ' +
                'Responde SIEMPRE con un JSON array válido. Cada insight tiene: category (enum: "nutrition"|"exercise"|"sleep"|"recovery"|"general"), ' +
                'content (string con el insight en español rioplatense, cálido y motivacional), score (number 0-100, confianza del modelo). ' +
                'Máximo 3 insights por respuesta.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        const raw = response.choices[0]?.message?.content;
        if (!raw) {
          this.logger.warn('Empty response from NIM');
          return [];
        }

        return this.parseInsights(raw, userId, correlationId);
      } catch (error) {
        this.logger.error(
          `NIM attempt ${attempt}/${this.maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        if (attempt === this.maxRetries) {
          throw error;
        }
      }
    }

    return [];
  }

  async validateInsight(_insightId: string, _action: string): Promise<void> {
    // Validation happens client-side or via a lighter model — not needed on NIM for MVP
    this.logger.warn('NIMAdapter.validateInsight is not implemented (stub)');
  }

  private buildPrompt(context?: HealthDataContext): string {
    if (!context || context.recentTelemetry.length === 0) {
      return 'El usuario no tiene datos biométricos recientes. Generá un insight motivacional general para empezar su viaje fitness.';
    }

    const sanitize = (s: string) =>
      String(s)
        .replace(/[\n\r]/g, ' ')
        .replace(/[<>]/g, '')
        .slice(0, 80);

    const metrics = context.recentTelemetry
      .map(
        (t) =>
          `- ${sanitize(t.metricType)}: ${sanitize(String(t.value))} ${sanitize(t.unit)} (${new Date(t.recordedAt).toLocaleDateString()})`,
      )
      .join('\n');

    const userState = context.userState
      ? `Estado actual: ${sanitize(context.userState)}`
      : '';

    return `Datos biométricos recientes del usuario:

${metrics}

${userState}

Generá insights personalizados de fitness y salud basados en estos datos.`;
  }

  private parseInsights(
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
      this.logger.warn('Failed to parse NIM response as JSON, returning empty');
      return [];
    }
  }
}
