import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthTelemetryModule } from './modules/health-telemetry/health-telemetry.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [PrismaModule, HealthTelemetryModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
