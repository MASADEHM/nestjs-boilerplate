import { Prisma } from '@generated/prisma';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

const { PrismaClientKnownRequestError } = Prisma;
type PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

/**
 * Global Exception Filter
 *
 * System-wide exception handler that catches all unhandled exceptions and transforms them
 * into consistent, well-formatted HTTP responses. This filter is the final layer in the
 * exception handling pipeline.
 *
 * **Architecture Flow:**
 * 1. Services/Controllers → ApiException.badRequest() → throws HttpException
 * 2. This filter catches ALL exceptions (@Catch() decorator)
 * 3. Formats them into standardized JSON responses
 * 4. Adds proper logging, correlation IDs, and debugging info
 *
 * **Exception Types Handled:**
 * - HttpExceptions (from ApiException factory) → Standardized API responses
 * - PrismaClientKnownRequestError → Database error mapping
 * - General Error instances → Internal server errors
 * - Unknown exceptions → Safe fallback responses
 *
 * **Response Features:**
 * - Consistent JSON structure across all errors
 * - Proper HTTP status codes
 * - Correlation IDs for request tracing
 * - Development-mode debugging information
 * - Structured logging with appropriate levels
 *
 * **Benefits:**
 * - Single point of control for error response formatting
 * - Prevents sensitive information leakage in production
 * - Comprehensive logging for debugging and monitoring
 * - Client-friendly error
 *
 * @example Response Format:
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "User not found",
 *   "error": "Bad Request",
 *   "errorCode": "USER_NOT_FOUND",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "path": "/api/users/123",
 *   "correlationId": "req-12345-abc"
 * }
 * ```
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, details, errorCode } =
      this.getErrorInfo(exception);
    const correlationId = Array.isArray(request.headers['x-correlation-id'])
      ? request.headers['x-correlation-id'][0]
      : (request.headers['x-correlation-id'] ?? 'unknown');

    // Note: Logging is handled by LoggingInterceptor to avoid duplicates
    // This filter only formats the HTTP response

    // Send formatted error response with proper HTTP status code
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      error: (HttpStatus[status] as string | undefined) ?? 'Unknown Error',
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      ...(details !== undefined && details !== null ? { details } : {}),
      // Include additional debugging info in development
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    };

    // ✅ This sets BOTH the HTTP status AND sends JSON body
    response.status(status).json(errorResponse);
  }

  private getErrorInfo(exception: unknown): {
    status: number;
    message: string;
    details?: unknown;
    errorCode?: string;
  } {
    // Handle HTTP exceptions (from NestJS/ApiException)
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    // Handle Prisma database errors
    if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // Handle general errors
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          exception.message === ''
            ? 'Internal server error'
            : exception.message,
        errorCode: 'INTERNAL_ERROR',
      };
    }

    // Handle unknown exceptions
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      errorCode: 'UNKNOWN_ERROR',
    };
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    message: string;
    details?: unknown;
    errorCode?: string;
  } {
    const message = this.extractMessage(exception);
    const metadata = this.extractMetadata(exception);

    // Check if this is a validation error (status 400 and has message array)
    const response = exception.getResponse();
    const isValidationError =
      exception.getStatus() === 400 &&
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray((response as Record<string, unknown>).message);

    if (isValidationError) {
      const validationDetails = this.formatValidationErrors(
        response as Record<string, unknown>
      );
      const translatedMessage = 'Validation error';

      return {
        status: exception.getStatus(),
        message: translatedMessage,
        details: validationDetails,
        errorCode: 'VALIDATION_ERROR',
      };
    }

    return {
      status: exception.getStatus(),
      message,
      details: metadata.details ?? metadata.validationErrors,
      errorCode: metadata.errorCode,
    };
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object') {
      const responseObj = response as Record<string, unknown>;

      // Handle single message (not validation arrays)
      if ('message' in responseObj && typeof responseObj.message === 'string') {
        return responseObj.message;
      }
    }

    return 'An error occurred';
  }

  private extractMetadata(exception: HttpException): {
    errorCode?: string;
    details?: unknown;
    validationErrors?: unknown;
  } {
    const exceptionObj = exception as unknown as Record<string, unknown>;
    return {
      errorCode:
        'errorCode' in exceptionObj &&
        typeof exceptionObj.errorCode === 'string'
          ? exceptionObj.errorCode
          : undefined,
      details: 'details' in exceptionObj ? exceptionObj.details : undefined,
      validationErrors:
        'validationErrors' in exceptionObj
          ? exceptionObj.validationErrors
          : undefined,
    };
  }

  private formatValidationErrors(
    response: Record<string, unknown>
  ): Record<string, string> {
    const validationDetails: Record<string, string> = {};

    if (Array.isArray(response.message)) {
      const messageArray = response.message as string[];
      messageArray.forEach((error: string) => {
        // Extract field name from error message like "email must be an email"
        const parts = error.split(' ');
        const fieldName = parts[0];
        const errorMessage = parts.slice(1).join(' ');
        validationDetails[fieldName] = errorMessage;
      });
    }

    return validationDetails;
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    details?: unknown;
    errorCode?: string;
  } {
    switch (error.code) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'The provided value is too long for the field',
          errorCode: 'VALUE_TOO_LONG',
          details:
            process.env.NODE_ENV === 'development' ? error.meta : undefined,
        };
      case 'P2001':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found in database',
          errorCode: 'RECORD_NOT_FOUND',
        };
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A unique constraint violation occurred',
          errorCode: 'UNIQUE_CONSTRAINT_VIOLATION',
          details:
            process.env.NODE_ENV === 'development'
              ? {
                  target: error.meta?.target,
                }
              : undefined,
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint violation',
          errorCode: 'FOREIGN_KEY_VIOLATION',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          errorCode: 'RECORD_NOT_FOUND',
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation reference',
          errorCode: 'INVALID_RELATION',
        };
      case 'P2015':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Related record not found',
          errorCode: 'RELATED_RECORD_NOT_FOUND',
        };
      case 'P2016':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Query interpretation error',
          errorCode: 'QUERY_INTERPRETATION_ERROR',
        };
      case 'P2017':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Records not connected through relation',
          errorCode: 'RECORDS_NOT_CONNECTED',
        };
      case 'P2018':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Required connected records not found',
          errorCode: 'REQUIRED_CONNECTED_RECORDS_NOT_FOUND',
        };
      case 'P2019':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Input error in query',
          errorCode: 'INPUT_ERROR',
        };
      case 'P2020':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Value out of range for field type',
          errorCode: 'VALUE_OUT_OF_RANGE',
        };
      case 'P2021':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Table does not exist in database',
          errorCode: 'TABLE_NOT_EXISTS',
        };
      case 'P2022':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Column does not exist in database',
          errorCode: 'COLUMN_NOT_EXISTS',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          errorCode: `PRISMA_${error.code}`,
          details:
            process.env.NODE_ENV === 'development'
              ? { code: error.code, message: error.message }
              : undefined,
        };
    }
  }
}
