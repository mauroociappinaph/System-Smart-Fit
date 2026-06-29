import { IsIn, IsNotEmpty } from 'class-validator';

const VALID_ACTIONS = ['approve', 'reject', 'discard'] as const;
type Action = (typeof VALID_ACTIONS)[number];

export class ValidateInsightRequestDto {
  @IsIn(VALID_ACTIONS)
  @IsNotEmpty()
  action: Action;
}
