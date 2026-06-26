import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates cross-field rules for ListInsightsQueryDto:
 *  - month is mutually exclusive with startDate/endDate
 *  - startDate must be ≤ endDate
 */
@ValidatorConstraint({ name: 'validateDateFilters', async: false })
export class ValidateDateFiltersConstraint
  implements ValidatorConstraintInterface
{
  validate(_value: unknown, args: ValidationArguments): boolean {
    const dto = args.object as {
      month?: number;
      startDate?: number;
      endDate?: number;
    };

    // Mutual exclusivity: month vs startDate/endDate
    if (dto.month !== undefined && dto.startDate !== undefined) {
      return false;
    }

    // startDate must be ≤ endDate
    if (
      dto.startDate !== undefined &&
      dto.endDate !== undefined &&
      dto.startDate > dto.endDate
    ) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as {
      month?: number;
      startDate?: number;
      endDate?: number;
    };

    if (dto.month !== undefined && dto.startDate !== undefined) {
      return 'No se puede combinar el filtro por mes con el rango de fechas';
    }

    return 'La fecha de inicio no puede ser mayor a la fecha de fin';
  }
}