import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthTelemetryModule } from './modules/health-telemetry/health-telemetry.module';

@Module({
  imports: [HealthTelemetryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
