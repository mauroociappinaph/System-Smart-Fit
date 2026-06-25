import { Test, TestingModule } from '@nestjs/testing';
import { AgentInsightController } from './agent-insight.controller';
import { CreateInsightService } from '../../application/use-cases/create-insight.service';
import { ValidateInsightService } from '../../application/use-cases/validate-insight.service';
import { GetUserInsightsService } from '../../application/use-cases/get-user-insights.service';
import { CreateInsightRequestDto } from '../dtos/create-insight.request.dto';
import { ValidateInsightRequestDto } from '../dtos/validate-insight.request.dto';
import { ListInsightsQueryDto } from '../dtos/list-insights.query.dto';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

describe('AgentInsightController', () => {
  let controller: AgentInsightController;
  let mockCreateService: jest.Mocked<CreateInsightService>;
  let mockValidateService: jest.Mocked<ValidateInsightService>;
  let mockListService: jest.Mocked<GetUserInsightsService>;

  beforeEach(async () => {
    mockCreateService = {
      execute: jest.fn().mockResolvedValue({ entityId: 'insight-1', event: {} }),
    } as any;

    mockValidateService = {
      execute: jest.fn().mockResolvedValue({
        id: 'insight-1',
        validationStatus: 'approved',
      }),
    } as any;

    mockListService = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentInsightController],
      providers: [
        { provide: CreateInsightService, useValue: mockCreateService },
        { provide: ValidateInsightService, useValue: mockValidateService },
        { provide: GetUserInsightsService, useValue: mockListService },
      ],
    }).compile();

    controller = module.get<AgentInsightController>(AgentInsightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /insights', () => {
    it('should call createInsightService and return insightId', async () => {
      const dto: CreateInsightRequestDto = {
        userId: 'user-1',
        correlationId: 'corr-1',
        category: 'nutrition',
        content: 'User has high protein intake',
        score: 0.85,
      };

      const result = await controller.create(dto);

      expect(mockCreateService.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        correlationId: 'corr-1',
        category: 'nutrition',
        content: 'User has high protein intake',
        score: 0.85,
        insightId: undefined,
        eventId: undefined,
      });

      expect(result).toEqual({ insightId: 'insight-1' });
    });

    it('should pass optional insightId and eventId when provided', async () => {
      const dto: CreateInsightRequestDto = {
        userId: 'user-1',
        correlationId: 'corr-1',
        category: 'nutrition',
        content: 'Test insight',
        score: 0.5,
        insightId: 'custom-id',
        eventId: 'custom-event',
      };

      await controller.create(dto);

      expect(mockCreateService.execute).toHaveBeenCalledWith({
        userId: 'user-1',
        correlationId: 'corr-1',
        category: 'nutrition',
        content: 'Test insight',
        score: 0.5,
        insightId: 'custom-id',
        eventId: 'custom-event',
      });
    });
  });

  describe('GET /insights', () => {
    it('should return paginated insights for a user', async () => {
      const insight = AgentInsight.reconstitute(
        'insight-1', 'user-1', 'corr-1', 'nutrition',
        'High protein intake', 0.85, 'pending' as any, 1000, 1000,
      );

      mockListService.execute.mockResolvedValue({ data: [insight], total: 1 });

      const query: ListInsightsQueryDto = { userId: 'user-1' };

      const result = await controller.list(query);

      expect(mockListService.execute).toHaveBeenCalledWith('user-1', {
        limit: undefined,
        offset: undefined,
      });

      expect(result).toEqual({
        data: [
          {
            id: 'insight-1',
            userId: 'user-1',
            category: 'nutrition',
            content: 'High protein intake',
            score: 0.85,
            validationStatus: 'pending',
            createdAt: 1000,
            updatedAt: 1000,
          },
        ],
        total: 1,
      });
    });

    it('should pass limit and offset query params', async () => {
      mockListService.execute.mockResolvedValue({ data: [], total: 0 });

      const query: ListInsightsQueryDto = {
        userId: 'user-2',
        limit: 10,
        offset: 20,
      };

      await controller.list(query);

      expect(mockListService.execute).toHaveBeenCalledWith('user-2', {
        limit: 10,
        offset: 20,
      });
    });
  });

  describe('PATCH /insights/:id/validate', () => {
    it('should call validateInsightService with id and action', async () => {
      const dto: ValidateInsightRequestDto = { action: 'approve' };

      const result = await controller.validate('insight-1', dto);

      expect(mockValidateService.execute).toHaveBeenCalledWith('insight-1', 'approve');
      expect(result).toEqual({ insightId: 'insight-1', status: 'approved' });
    });

    it('should forward reject action correctly', async () => {
      mockValidateService.execute.mockResolvedValueOnce({
        id: 'insight-2',
        validationStatus: 'rejected',
      } as any);

      const result = await controller.validate('insight-2', { action: 'reject' });

      expect(mockValidateService.execute).toHaveBeenCalledWith('insight-2', 'reject');
      expect(result).toEqual({ insightId: 'insight-2', status: 'rejected' });
    });

    it('should forward discard action correctly', async () => {
      mockValidateService.execute.mockResolvedValueOnce({
        id: 'insight-3',
        validationStatus: 'discarded',
      } as any);

      const result = await controller.validate('insight-3', { action: 'discard' });

      expect(mockValidateService.execute).toHaveBeenCalledWith('insight-3', 'discard');
      expect(result).toEqual({ insightId: 'insight-3', status: 'discarded' });
    });
  });
});
