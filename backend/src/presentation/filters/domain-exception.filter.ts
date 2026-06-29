import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../shared/domain/error/domain.error';
import { AgentInsightNotFoundError } from '../../shared/domain/error/agent-insight-not-found.error';
import { InsightNotPendingError } from '../../shared/domain/error/insight-not-pending.error';

/**
 * Translates domain errors into proper NestJS HTTP responses.
 * Register this filter globally in AppModule or the appropriate controller scope.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AgentInsightNotFoundError) {
      response.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: exception.message,
        code: exception.code,
      });
    } else if (exception instanceof InsightNotPendingError) {
      response.status(409).json({
        statusCode: 409,
        error: 'Conflict',
        message: exception.message,
        code: exception.code,
      });
    } else {
      response.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: exception.message,
        code: exception.code,
      });
    }
  }
}
