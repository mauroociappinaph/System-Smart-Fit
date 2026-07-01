import { Module } from '@nestjs/common';
import { GenerateInsightsOnTelemetryListener } from './generate-insights-on-telemetry.listener';
import { AgentInsightModule } from '../../modules/agent-insight/agent-insight.module';

@Module({
  imports: [AgentInsightModule],
  providers: [GenerateInsightsOnTelemetryListener],
})
export class EventListenersModule {}
