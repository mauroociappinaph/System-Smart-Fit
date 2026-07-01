import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GenerateAndPersistInsightsUseCase } from '../../application/use-cases/generate-and-persist-insights.use-case';
import { HealthDataRecorded } from '../../domain/events/health-data-recorded.event';
import {
  Subject,
  groupBy,
  mergeMap,
  debounceTime,
  catchError,
  timeout,
  EMPTY,
  TimeoutError,
} from 'rxjs';

@Injectable()
export class GenerateInsightsOnTelemetryListener {
  private readonly logger = new Logger(
    GenerateInsightsOnTelemetryListener.name,
  );
  private readonly telemetrySubject = new Subject<HealthDataRecorded>();

  constructor(
    private readonly generateAndPersistInsightsUseCase: GenerateAndPersistInsightsUseCase,
  ) {
    this.setupDebouncePipeline();
  }

  private setupDebouncePipeline(): void {
    this.telemetrySubject
      .pipe(
        groupBy((event) => event.payload.userId),
        mergeMap((group$) =>
          group$.pipe(
            timeout(3600000), // Monitor actual user activity (1h)
            debounceTime(5000), // Then debounce the resulting emissions
            catchError((err) => {
              if (err instanceof TimeoutError) {
                // Normal group expiration, no need to log as error
                return EMPTY;
              }
              this.logger.error(`Error in user group stream: ${err.message}`);
              return EMPTY; // Keep the main telemetrySubject alive
            }),
          ),
        ),
      )
      .subscribe({
        next: (event) => this.processEvent(event),
        error: (err) =>
          this.logger.error(`CRITICAL: Pipeline died: ${err.message}`, err),
      });
  }

  @OnEvent('health_telemetry.recorded')
  async handle(event: HealthDataRecorded): Promise<void> {
    this.logger.log(
      `Received health_telemetry.recorded event: ${event.eventId}. Queuing for debounced processing.`,
    );
    this.telemetrySubject.next(event);
  }

  private async processEvent(event: HealthDataRecorded): Promise<void> {
    try {
      await this.generateAndPersistInsightsUseCase.execute({
        userId: event.payload.userId,
        correlationId: event.correlationId,
        telemetryId: event.eventId,
        userState: undefined,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate insights on telemetry: ${(error as Error).message}`,
        error as Error,
      );
    }
  }
}
