export interface AppError extends Error {
  message: string;
  statusCode?: number;
  code?: string;
}

export interface PrismaError extends Error {
  code: string;
  meta?: unknown;
}
