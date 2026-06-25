import { IsIn, IsNotEmpty } from 'class-validator';

const VALID_ACTIONS = ['approve', 'reject', 'discard'] as const;

export class ValidateInsightRequestDto {
  @IsIn(VALID_ACTIONS)
  @IsNotEmpty()
  action: 'approve' | 'reject' | 'discard';
}
