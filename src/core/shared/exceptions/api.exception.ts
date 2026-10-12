import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import type { ExceptionWithMetadata } from '@core/shared/types/core.types';

/**
 * Centralized Exception Factory
 *
 * Provides a unified API for creating HTTP exceptions.
 * Controllers/services handle translation and pass the translated message to these methods.
 *
 * **Architecture:**
 * - This factory creates exceptions with metadata (does not throw)
 * - Callers must explicitly throw the returned exception
 * - GlobalExceptionFilter catches these exceptions and formats HTTP responses
 * - Services/controllers use this instead of direct NestJS exception classes
 *
 * **Benefits:**
 * - Consistent error structure with metadata support
 * - Standardized error metadata (codes, details, validation errors)
 * - Single point of control for exception behavior
 * - Explicit throw statements satisfy TypeScript's control flow analysis
 *
 * @example
 * ```typescript
 * // Controllers handle translation:
 * const message = i18n.t('user.notFound');
 * throw ApiException.badRequest(message, { userId: 123 });
 * ```
 */
export const ApiException = {
  /**
   * Create a 400 Bad Request exception (caller must throw)
   */
  badRequest(
    message: string | Record<string, unknown>,
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage = typeof message === 'string' ? message : 'Bad Request';
    const exception = new BadRequestException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a 401 Unauthorized exception (caller must throw)
   */
  unauthorized(
    message: string | Record<string, unknown> = 'Unauthorized access',
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Unauthorized access';
    const exception = new UnauthorizedException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a 403 Forbidden exception (caller must throw)
   */
  forbidden(
    message: string | Record<string, unknown> = 'Access forbidden',
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Access forbidden';
    const exception = new ForbiddenException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a 404 Not Found exception (caller must throw)
   */
  notFound(
    message: string | Record<string, unknown> = 'Resource not found',
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Resource not found';
    const exception = new NotFoundException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a 409 Conflict exception (caller must throw)
   */
  conflict(
    message: string | Record<string, unknown> = 'Resource already exists',
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Resource already exists';
    const exception = new ConflictException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a 422 Unprocessable Entity exception (caller must throw)
   */
  validationError(
    message: string | Record<string, unknown> = 'Validation failed',
    validationErrors?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Validation failed';
    const exception = new UnprocessableEntityException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.validationErrors = validationErrors;

    return exception;
  },

  /**
   * Create a 500 Internal Server Error exception (caller must throw)
   */
  internalError(
    message: string | Record<string, unknown> = 'Internal server error',
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage =
      typeof message === 'string' ? message : 'Internal server error';
    const exception = new InternalServerErrorException(
      finalMessage
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Create a custom HTTP exception (caller must throw)
   */
  custom(
    statusCode: number,
    message: string | Record<string, unknown>,
    details?: unknown,
    errorCode?: string
  ): ExceptionWithMetadata {
    const finalMessage = typeof message === 'string' ? message : 'Custom error';
    const exception = new HttpException(
      finalMessage,
      statusCode
    ) as ExceptionWithMetadata;

    exception.errorCode = errorCode;
    exception.details = details;

    return exception;
  },

  /**
   * Handle validation errors from class-validator (caller must throw)
   */
  fromValidationErrors(
    validationErrors: ValidationError[],
    message: string = 'Validation failed'
  ): ExceptionWithMetadata {
    const formattedErrors = validationErrors.map((error) => ({
      field: error.property,
      constraints: error.constraints ?? {},
      value: error.value,
    }));

    return ApiException.validationError(
      message,
      formattedErrors,
      'VALIDATION_FAILED'
    );
  },
};

// Interface for validation errors
interface ValidationError {
  property: string;
  constraints?: { [type: string]: string };
  value?: unknown;
}
