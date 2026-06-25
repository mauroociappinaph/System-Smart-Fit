import { Module } from '@nestjs/common';
import { CreateInsightService } from '../../application/use-cases/create-insight.service';
import { ValidateInsightService } from '../../application/use-cases/validate-insight.service';
import { GetUserInsightsService } from '../../application/use-cases/get-user-insights.service';
import { AgentInsightPrismaRepository } from '../../infrastructure/persistence/agent-insight-prisma.repository';

@Module({
  providers: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
    {
      provide: 'AgentInsightRepository',
      useClass: AgentInsightPrismaRepository,
    },
  ],
  exports: [
    CreateInsightService,
    ValidateInsightService,
    GetUserInsightsService,
  ],
})
export class AgentInsightModule {}
