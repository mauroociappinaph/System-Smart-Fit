import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0)
  score: number;

  @IsString()
  @IsOptional()
  insightId?: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}
