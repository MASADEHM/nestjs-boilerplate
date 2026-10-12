import { ValidateBy } from 'class-validator';

import type { ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Custom validator to check if a date is in the past
 *
 * @param validationOptions - Optional validation options
 *
 * @example
 * ```typescript
 * export class CreateUserDto {
 *   @IsDate()
 *   @IsPastDate({
 *     message: 'birth_date Birth date must be in the past',
 *   })
 *   birth_date: Date;
 * }
 * ```
 *
 * @note Message format should be: 'fieldName Description of the error'
 * This ensures proper parsing by the global exception filter.
 */
export function IsPastDate(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isPastDate',
      validator: {
        validate(value: Date | null | undefined, _args: ValidationArguments) {
          if (value == null) {
            return true; // Skip validation if date is missing
          }

          const now = new Date();
          return value < now;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a past date`;
        },
      },
    },
    validationOptions
  );
}
