import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GENERATE_INSIGHTS_PORT } from '../../application/ports/out/generate-insights.port';
import { InferenceStubAdapter } from './inference.stub';
import { NIMAdapter } from './nim.adapter';
import { MistralAdapter } from './mistral.adapter';

const adapterProvider = {
  provide: GENERATE_INSIGHTS_PORT,
  useFactory: (configService: ConfigService) => {
    const adapter = configService.get<string>('AI_ADAPTER') ?? 'stub';

    switch (adapter) {
      case 'nim':
        return new NIMAdapter(configService);
      case 'mistral':
        return new MistralAdapter(configService);
      case 'stub':
      default:
        return new InferenceStubAdapter();
    }
  },
  inject: [ConfigService],
};

@Module({
  providers: [
    adapterProvider,
    InferenceStubAdapter,
    NIMAdapter,
    MistralAdapter,
  ],
  exports: [GENERATE_INSIGHTS_PORT],
})
export class InferenceModule implements OnModuleInit {
  private readonly logger = new Logger(InferenceModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const adapter = this.configService.get<string>('AI_ADAPTER') ?? 'stub';
    this.logger.log(`AI Inference adapter selected: ${adapter}`);
  }
}
