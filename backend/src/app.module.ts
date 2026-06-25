import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthTelemetryModule } from './modules/health-telemetry/health-telemetry.module';

@Module({
  imports: [PrismaModule, HealthTelemetryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
