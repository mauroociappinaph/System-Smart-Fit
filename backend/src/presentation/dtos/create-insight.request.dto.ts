import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInsightRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  correlationId: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  score: number;

  @IsUUID('4')
  @IsOptional()
  insightId?: string;

  @IsUUID('4')
  @IsOptional()
  eventId?: string;
}
