import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import { HealthDataContext } from './health-data-context.type';

@Injectable()
export class MistralAdapter implements GenerateInsightsPort {
  private readonly logger = new Logger(MistralAdapter.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      baseURL: 'https://api.mistral.ai/v1',
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
    });
    this.model =
      this.configService.get<string>('MISTRAL_MODEL') ?? 'mistral-tiny';
  }

  async generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
    context?: HealthDataContext,
  ): Promise<AgentInsight[]> {
    this.logger.log(
      `Generating insights for user ${userId} via Mistral (${this.model})`,
    );

    const prompt = this.buildPrompt(context);

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
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) {
        this.logger.warn('Empty response from Mistral');
        return [];
      }

      return this.parseInsights(raw, userId, correlationId);
    } catch (error) {
      this.logger.error(
        `Mistral inference failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async validateInsight(_insightId: string, _action: string): Promise<void> {
    this.logger.warn(
      'MistralAdapter.validateInsight is not implemented (stub)',
    );
  }

  private buildPrompt(context?: HealthDataContext): string {
    if (!context || context.recentTelemetry.length === 0) {
      return 'El usuario no tiene datos biométricos recientes. Generá un insight motivacional general para empezar su viaje fitness.';
    }

    const metrics = context.recentTelemetry
      .map(
        (t) =>
          `- ${t.metricType}: ${t.value} ${t.unit} (${new Date(t.recordedAt).toLocaleDateString()})`,
      )
      .join('\n');

    return `Datos biométricos recientes del usuario:

${metrics}

${context.userState ? `Estado actual: ${context.userState}` : ''}

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
        const { entity } = AgentInsight.create(
          userId,
          correlationId,
          String(item.category ?? 'general'),
          String(item.content ?? ''),
          Number(item.score ?? 50),
        );
        return entity;
      });
    } catch {
      this.logger.warn(
        'Failed to parse Mistral response as JSON, returning empty',
      );
      return [];
    }
  }
}
