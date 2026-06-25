import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthTelemetryModule } from './modules/health-telemetry/health-telemetry.module';
import { UserModule } from './modules/user/user.module';
import { UserStateModule } from './modules/user-state/user-state.module';
import { AgentInsightModule } from './modules/agent-insight/agent-insight.module';

@Module({
  imports: [PrismaModule, HealthTelemetryModule, UserModule, UserStateModule, AgentInsightModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
