import { Module } from '@nestjs/common';
import { AgentInsightController } from '../../presentation/controllers/agent-insight.controller';
import { CreateInsightService } from '../../application/use-cases/create-insight.service';
import { ValidateInsightService } from '../../application/use-cases/validate-insight.service';
import { GetUserInsightsService } from '../../application/use-cases/get-user-insights.service';
import { GenerateAndPersistInsightsUseCase } from '../../application/use-cases/generate-and-persist-insights.use-case';
import { HealthDataNormalizer } from '../../application/services/health-data-normalizer';
import { AgentInsightPrismaRepository } from '../../infrastructure/persistence/agent-insight-prisma.repository';
import { InferenceModule } from '../../infrastructure/inference/inference.module';

@Module({
  imports: [InferenceModule],
  controllers: [AgentInsightController],
  providers: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
    GenerateAndPersistInsightsUseCase,
    HealthDataNormalizer,
    {
      provide: 'AgentInsightRepository',
      useClass: AgentInsightPrismaRepository,
    },
  ],
  exports: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
    GenerateAndPersistInsightsUseCase,
    HealthDataNormalizer,
  ],
})
export class AgentInsightModule {}
