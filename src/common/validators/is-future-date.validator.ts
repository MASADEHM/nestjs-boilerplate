import { ValidateBy } from 'class-validator';

import type { ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Custom validator to check if a date is in the future
 *
 * @param validationOptions - Optional validation options
 *
 * @example
 * ```typescript
 * export class CreateEventDto {
 *   @IsDate()
 *   @IsFutureDate({
 *     message: 'event_date Event date must be in the future',
 *   })
 *   event_date: Date;
 * }
 * ```
 *
 * @note Message format should be: 'fieldName Description of the error'
 * This ensures proper parsing by the global exception filter.
 */
export function IsFutureDate(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isFutureDate',
      validator: {
        validate(value: Date | null | undefined, _args: ValidationArguments) {
          if (value == null) {
            return true; // Skip validation if date is missing
          }

          const now = new Date();
          return value > now;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`;
        },
      },
    },
    validationOptions
  );
}
