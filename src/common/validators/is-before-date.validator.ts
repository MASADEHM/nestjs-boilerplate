import { ValidateBy } from 'class-validator';

import type { ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Custom validator to check if a date field is before another date field
 *
 * @param property - The name of the property to compare against
 * @param validationOptions - Optional validation options
 *
 * @example
 * ```typescript
 * export class CreateEventDto {
 *   @IsDate()
 *   @IsBeforeDate('end_date', {
 *     message: 'start_date Start date must be before end date',
 *   })
 *   start_date: Date;
 *
 *   @IsDate()
 *   end_date: Date;
 * }
 * ```
 *
 * @note Message format should be: 'fieldName Description of the error'
 * This ensures proper parsing by the global exception filter.
 */
export function IsBeforeDate(
  property: string,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isBeforeDate',
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

          return value < relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          return `${args.property} must be before ${relatedPropertyName}`;
        },
      },
    },
    validationOptions
  );
}
