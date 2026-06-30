import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GENERATE_INSIGHTS_PORT } from '../../application/ports/out/generate-insights.port';
import { InferenceStubAdapter } from './inference.stub';
import { NIMAdapter } from './nim.adapter';
import { MistralAdapter } from './mistral.adapter';
import { FallbackAdapter } from './fallback.adapter';

const nimProvider = {
  provide: 'NimAdapter',
  useFactory: (configService: ConfigService) => new NIMAdapter(configService),
  inject: [ConfigService],
};

const mistralProvider = {
  provide: 'MistralAdapter',
  useFactory: (configService: ConfigService) =>
    new MistralAdapter(configService),
  inject: [ConfigService],
};

const adapterProvider = {
  provide: GENERATE_INSIGHTS_PORT,
  useFactory: (
    configService: ConfigService,
    nimAdapter: NIMAdapter,
    mistralAdapter: MistralAdapter,
  ) => {
    const adapter = configService.get<string>('AI_ADAPTER') ?? 'fallback';

    switch (adapter) {
      case 'nim':
        return nimAdapter;
      case 'mistral':
        return mistralAdapter;
      case 'fallback':
      default:
        // Primary: NIM, Fallback: Mistral
        return new FallbackAdapter(nimAdapter, mistralAdapter);
    }
  },
  inject: [ConfigService, 'NimAdapter', 'MistralAdapter'],
};

@Module({
  providers: [
    adapterProvider,
    nimProvider,
    mistralProvider,
    InferenceStubAdapter,
  ],
  exports: [GENERATE_INSIGHTS_PORT],
})
export class InferenceModule implements OnModuleInit {
  private readonly logger = new Logger(InferenceModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const adapter = this.configService.get<string>('AI_ADAPTER') ?? 'fallback';
    this.logger.log(`AI Inference adapter selected: ${adapter}`);
  }
}
