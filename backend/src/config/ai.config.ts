import { ConfigService } from '@nestjs/config';

export interface AiConfig {
  adapter: 'stub' | 'nim' | 'mistral';
  nimApiKey: string;
  mistralApiKey: string;
}

export const validateAiConfig = (configService: ConfigService): AiConfig => {
  const adapter = configService.get<AiConfig['adapter']>('AI_ADAPTER', 'stub');
  const nimApiKey = configService.get<string>('NIM_API_KEY', '');
  const mistralApiKey = configService.get<string>('MISTRAL_API_KEY', '');

  return {
    adapter,
    nimApiKey,
    mistralApiKey,
  };
};
