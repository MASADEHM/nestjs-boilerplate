import type { AppError, PrismaError } from '@core/shared/types';

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'message' in error;
}

export function isPrismaError(error: unknown): error is PrismaError {
  return error instanceof Error && 'code' in error;
}
