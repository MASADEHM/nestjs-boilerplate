# Custom Validators

This directory contains reusable custom validators for the application.

## Available Validators

### Date Validators

#### `@IsAfterDate(property: string)`
Validates that a date field is after another date field.

```typescript
@IsDate()
start_date: Date;

@IsDate()
@IsAfterDate('start_date', {
  message: 'end_date End date must be after start date',
})
end_date: Date;
```

#### `@IsBeforeDate(property: string)`
Validates that a date field is before another date field.

```typescript
@IsDate()
@IsBeforeDate('end_date', {
  message: 'start_date Start date must be before end date',
})
start_date: Date;

@IsDate()
end_date: Date;
```

#### `@IsFutureDate()`
Validates that a date is in the future.

```typescript
@IsDate()
@IsFutureDate({
  message: 'event_date Event date must be in the future',
})
event_date: Date;
```

#### `@IsPastDate()`
Validates that a date is in the past.

```typescript
@IsDate()
@IsPastDate({
  message: 'birth_date Birth date must be in the past',
})
birth_date: Date;
```

## Message Format

For proper integration with the global exception filter, custom validation messages should follow this format:

```
'fieldName Description of the error'
```

Example:
```typescript
@IsAfterDate('license_issue_date', {
  message: 'license_expiry_date License expiry date must be after license issue date',
})
```

This ensures the error response is properly formatted as:
```json
{
  "license_expiry_date": "License expiry date must be after license issue date"
}
```

## Usage

Import validators from the common module:

```typescript
import { IsAfterDate, IsFutureDate } from '@common/validators';
```
