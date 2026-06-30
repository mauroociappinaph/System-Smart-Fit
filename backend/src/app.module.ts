import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthTelemetryModule } from './modules/health-telemetry/health-telemetry.module';
import { UserModule } from './modules/user/user.module';
import { UserStateModule } from './modules/user-state/user-state.module';
import { AgentInsightModule } from './modules/agent-insight/agent-insight.module';
import { AuthModule } from './modules/auth/auth.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthTelemetryModule,
    UserModule,
    UserStateModule,
    AgentInsightModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
