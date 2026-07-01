import { ConfigService } from '@nestjs/config';
import { validateAiConfig } from './ai.config';

describe('AiConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should return default values when env vars are not provided', () => {
    // Mocking ConfigService.get
    jest
      .spyOn(configService, 'get')
      .mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'AI_ADAPTER') return defaultValue;
        if (key === 'NIM_API_KEY') return '';
        if (key === 'MISTRAL_API_KEY') return '';
        return undefined;
      });

    const config = validateAiConfig(configService);

    expect(config.adapter).toBe('stub');
    expect(config.nimApiKey).toBe('');
    expect(config.mistralApiKey).toBe('');
  });

  it('should return correct values from env vars', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      switch (key) {
        case 'AI_ADAPTER':
          return 'nim';
        case 'NIM_API_KEY':
          return 'test-nim-key';
        case 'MISTRAL_API_KEY':
          return 'test-mistral-key';
        default:
          return undefined;
      }
    });

    const config = validateAiConfig(configService);

    expect(config.adapter).toBe('nim');
    expect(config.nimApiKey).toBe('test-nim-key');
    expect(config.mistralApiKey).toBe('test-mistral-key');
  });
});
