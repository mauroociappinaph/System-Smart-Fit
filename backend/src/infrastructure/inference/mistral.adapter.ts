import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import type { HealthDataContext } from '../../application/dto/health-data-context.dto';
import { BaseInferenceAdapter } from './base-inference.adapter';

@Injectable()
export class MistralAdapter extends BaseInferenceAdapter {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxRetries = 2;

  constructor(configService: ConfigService) {
    super();
    this.client = new OpenAI({
      baseURL: 'https://api.mistral.ai/v1',
      apiKey: configService.getOrThrow<string>('MISTRAL_API_KEY'),
    });
    this.model = configService.get<string>('MISTRAL_MODEL') ?? 'mistral-tiny';
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
          this.logger.warn('Empty response from Mistral');
          return [];
        }

        return this.parseInsights(raw, userId, correlationId);
      } catch (error) {
        this.logger.error(
          `Mistral attempt ${attempt}/${this.maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        if (attempt === this.maxRetries) {
          throw error;
        }
      }
    }

    return [];
  }
}
