import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class RecordHealthTelemetryRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  metricType: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsNotEmpty()
  deviceTimestamp: number;

  @IsString()
  @IsOptional()
  correlationId?: string;
}
