import { ValidateBy } from 'class-validator';

import type { ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Custom validator to check if a date field is after another date field
 *
 * @param property - The name of the property to compare against
 * @param validationOptions - Optional validation options
 *
 * @example
 * ```typescript
 * export class CreateEventDto {
 *   @IsDate()
 *   start_date: Date;
 *
 *   @IsDate()
 *   @IsAfterDate('start_date', {
 *     message: 'end_date End date must be after start date',
 *   })
 *   end_date: Date;
 * }
 * ```
 *
 * @note Message format should be: 'fieldName Description of the error'
 * This ensures proper parsing by the global exception filter.
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isAfterDate',
      constraints: [property],
      validator: {
        validate(value: Date | null | undefined, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as Date | null | undefined;

          if (value == null || relatedValue == null) {
            return true; // Skip validation if either date is missing
          }

          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    },
    validationOptions
  );
}
