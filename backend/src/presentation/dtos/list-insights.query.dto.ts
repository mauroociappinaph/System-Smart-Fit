import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInsightsQueryDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  /**
   * Filter by month (1–12). 
   * Mutually exclusive with startDate/endDate.
   * C3 — ensures month does not exceed 12.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  /**
   * Optional year to use with month filter (e.g., 2024).
   * If not provided, defaults to current year.
   * Only relevant when `month` is provided.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  year?: number;

  /**
   * Start of date range filter (epoch ms).
   * Must not be greater than endDate.
   * C7 — startDate ≤ endDate consistency validated in service.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  startDate?: number;

  /**
   * End of date range filter (epoch ms).
   * Must not be less than startDate.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  endDate?: number;
}
