import { Module } from '@nestjs/common';
import { RecordStateTransitionService } from '../../application/use-cases/record-state-transition.service';
import { GetStateHistoryService } from '../../application/use-cases/get-state-history.service';
import { GetCurrentStateService } from '../../application/use-cases/get-current-state.service';
import { UserStatePrismaRepository } from '../../infrastructure/persistence/user-state-prisma.repository';

@Module({
  providers: [
    RecordStateTransitionService,
    GetStateHistoryService,
    GetCurrentStateService,
    {
      provide: 'UserStateRepository',
      useClass: UserStatePrismaRepository,
    },
  ],
  exports: [
    RecordStateTransitionService,
    GetStateHistoryService,
    GetCurrentStateService,
  ],
})
export class UserStateModule {}
