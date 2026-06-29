import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RecordHealthTelemetryRequestDto } from '../dtos/record-health-telemetry.request.dto';
import { RecordHealthTelemetryService } from '../../application/use-cases/record-health-telemetry.service';

@Controller('telemetry')
export class HealthTelemetryController {
  constructor(
    private readonly recordTelemetryService: RecordHealthTelemetryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async recordTelemetry(
    @Body() requestDto: RecordHealthTelemetryRequestDto,
  ): Promise<void> {
    await this.recordTelemetryService.execute({
      userId: requestDto.userId,
      metricType: requestDto.metricType,
      value: requestDto.value,
      unit: requestDto.unit,
      deviceTimestamp: requestDto.deviceTimestamp,
      correlationId: requestDto.correlationId,
    });
  }
}
