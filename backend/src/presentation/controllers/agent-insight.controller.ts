import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { CreateInsightRequestDto } from '../dtos/create-insight.request.dto';
import { ValidateInsightRequestDto } from '../dtos/validate-insight.request.dto';
import { ListInsightsQueryDto } from '../dtos/list-insights.query.dto';
import { CreateInsightService } from '../../application/use-cases/create-insight.service';
import { ValidateInsightService } from '../../application/use-cases/validate-insight.service';
import { GetUserInsightsService } from '../../application/use-cases/get-user-insights.service';

@Controller('insights')
export class AgentInsightController {
  constructor(
    private readonly createInsightService: CreateInsightService,
    private readonly validateInsightService: ValidateInsightService,
    private readonly getUserInsightsService: GetUserInsightsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInsightRequestDto): Promise<{ insightId: string }> {
    const { entityId } = await this.createInsightService.execute({
      userId: dto.userId,
      correlationId: dto.correlationId,
      category: dto.category,
      content: dto.content,
      score: dto.score,
      insightId: dto.insightId,
      eventId: dto.eventId,
    });

    return { insightId: entityId };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ListInsightsQueryDto,
    @CurrentUser() user: { sub: string },
  ): Promise<{
    data: Array<{
      id: string;
      userId: string;
      category: string;
      content: string;
      score: number;
      validationStatus: string;
      createdAt: number;
      updatedAt: number;
    }>;
    total: number;
  }> {
    const { data, total } = await this.getUserInsightsService.execute(
      user.sub,
      {
        limit: query.limit,
        offset: query.offset,
        month: query.month,
        year: query.year,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    );

    return {
      data: data.map((insight) => ({
        id: insight.id,
        userId: insight.userId,
        category: insight.category,
        content: insight.content,
        score: insight.score,
        validationStatus: insight.validationStatus,
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      })),
      total,
    };
  }

  @Patch(':id/validate')
  @HttpCode(HttpStatus.OK)
  async validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateInsightRequestDto,
  ): Promise<{ insightId: string; status: string }> {
    const insight = await this.validateInsightService.execute(id, dto.action);

    return { insightId: insight.id, status: insight.validationStatus };
  }
}
