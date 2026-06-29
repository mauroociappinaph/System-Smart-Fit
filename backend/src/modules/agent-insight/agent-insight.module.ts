import { Module } from '@nestjs/common';
import { AgentInsightController } from '../../presentation/controllers/agent-insight.controller';
import { CreateInsightService } from '../../application/use-cases/create-insight.service';
import { ValidateInsightService } from '../../application/use-cases/validate-insight.service';
import { GetUserInsightsService } from '../../application/use-cases/get-user-insights.service';
import { AgentInsightPrismaRepository } from '../../infrastructure/persistence/agent-insight-prisma.repository';
import { InferenceStubAdapter, GENERATE_INSIGHTS_PORT } from '../../infrastructure/inference/inference.stub';

@Module({
  controllers: [AgentInsightController],
  providers: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
    {
      provide: 'AgentInsightRepository',
      useClass: AgentInsightPrismaRepository,
    },
    {
      provide: GENERATE_INSIGHTS_PORT,
      useClass: InferenceStubAdapter,
    },
  ],
  exports: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
  ],
})
export class AgentInsightModule {}
