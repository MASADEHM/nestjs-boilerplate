/**
 * Winston Log Levels Enum
 *
 * Defines all log levels used in the application with their numeric priorities.
 * Lower numbers = higher priority (errors are most important)
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  EXCEPTION = 'exception',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

/**
 * Log Level Priorities for Winston
 *
 * Winston uses numeric priorities where lower = more important
 */
export const LOG_LEVEL_PRIORITIES = {
  [LogLevel.ERROR]: 0, // Regular errors (404, validation, etc.)
  [LogLevel.EXCEPTION]: 1, // Critical system errors (500+)
  [LogLevel.WARN]: 2, // Warnings
  [LogLevel.INFO]: 3, // User calls .info()
  [LogLevel.HTTP]: 4, // Request/response logs
  [LogLevel.VERBOSE]: 5, // Verbose info
  [LogLevel.DEBUG]: 6, // Debug info
  [LogLevel.SILLY]: 7, // Everything
} as const;
