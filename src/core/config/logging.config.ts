import { join } from 'node:path';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

import { LOG_LEVEL_PRIORITIES, LogLevel } from './log-levels.enum';

// Create logs directory path
const logsDir = join(process.cwd(), 'logs');

// Date pattern constant to avoid duplication
const DATE_PATTERN = 'YYYY-MM-DD' as const;

/**
 * Winston Logger Configuration for Production
 *
 * Features:
 * - JSON format for machine readability and future ELK integration
 * - Async file writes for ZERO performance impact on requests
 * - UTC timestamps for multi-host consistency
 * - Daily rotation with appropriate retention
 * - Structured logging ready for monitoring tools
 */
export const createWinstonLogger = (): ReturnType<
  typeof WinstonModule.createLogger
> => {
  // Use shared configuration
  const config = getSharedWinstonConfig();
  return WinstonModule.createLogger(config);
};

/**
 * Shared Winston configuration - used by both main.ts and core.module.ts
 * Single source of truth for all Winston settings
 */
export const getSharedWinstonConfig = (): winston.LoggerOptions => {
  // Base JSON format for all logs
  const baseJsonFormat = winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toISOString(), // UTC timestamps
    }),
    winston.format.errors({ stack: true }),
    winston.format.json() // Clean JSON output - NDJSON standard
  );

  // Create level-specific formats using Winston's format filtering
  const createLevelFilter = (targetLevel: LogLevel): winston.Logform.Format => {
    return winston.format.combine(
      winston.format.timestamp({
        format: () => new Date().toISOString(),
      }),
      winston.format.errors({ stack: true }),
      winston.format((info) => {
        // Only allow logs of the specific target level
        // Return false is valid for winston format filters to exclude logs
        return String(info.level) === String(targetLevel)
          ? info
          : (false as unknown as winston.Logform.TransformableInfo);
      })(),
      winston.format.json()
    );
  };

  // Human-readable format for console (development only)
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toISOString(),
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const timestamp = String(info.timestamp);
      const level = String(info.level);
      const message = String(info.message);
      const stack = typeof info.stack === 'string' ? info.stack : null;
      const context = typeof info.context === 'string' ? info.context : null;

      const logMessage = stack ?? message;
      const contextInfo =
        context != null && context !== '' ? ` [${context}]` : '';

      // Simple color mapping without winston.format.colorize() to avoid errors
      const levelColors: { [key: string]: string } = {
        error: '\u001B[31m', // Red
        exception: '\u001B[41m', // Red background
        warn: '\u001B[33m', // Yellow
        info: '\u001B[36m', // Cyan
        http: '\u001B[32m', // Green
        debug: '\u001B[35m', // Magenta
      };
      const reset = '\u001B[0m';
      const color = levelColors[level] ?? '';

      return `${timestamp} [${color}${level.toUpperCase()}${reset}]${contextInfo}: ${logMessage}`;
    })
  );

  const transports: winston.transport[] = [
    // Console transport for development/debugging - human readable
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // 1. ACCESS LOGS: Only HTTP request/response logs (→ and ←)
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'access-%DATE%.json'),
      datePattern: DATE_PATTERN,
      level: LogLevel.HTTP,
      maxSize: '20m',
      maxFiles: '14d',
      format: createLevelFilter(LogLevel.HTTP), // ONLY HTTP level
      options: {
        flags: 'a',
        highWaterMark: 64 * 1024,
      },
    }),

    // 2. INFO LOGS: Only when you call logger.info()
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'info-%DATE%.json'),
      datePattern: DATE_PATTERN,
      level: LogLevel.INFO,
      maxSize: '20m',
      maxFiles: '14d',
      format: createLevelFilter(LogLevel.INFO), // ONLY INFO level
      options: {
        flags: 'a',
        highWaterMark: 64 * 1024,
      },
    }),

    // 3. ERROR LOGS: Regular errors (404, validation, etc.)
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'error-%DATE%.json'),
      datePattern: DATE_PATTERN,
      level: LogLevel.ERROR,
      maxSize: '20m',
      maxFiles: '14d',
      format: createLevelFilter(LogLevel.ERROR), // ONLY ERROR level
      options: {
        flags: 'a',
        highWaterMark: 64 * 1024,
      },
    }),

    // 4. CRITICAL LOGS: 500+ system errors that need attention
    new winston.transports.DailyRotateFile({
      filename: join(logsDir, 'critical-%DATE%.json'),
      datePattern: DATE_PATTERN,
      level: LogLevel.EXCEPTION,
      maxSize: '20m',
      maxFiles: '14d',
      format: createLevelFilter(LogLevel.EXCEPTION), // ONLY EXCEPTION level
      options: {
        flags: 'a',
        highWaterMark: 64 * 1024,
      },
    }),
  ];

  return {
    level:
      process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    levels: LOG_LEVEL_PRIORITIES,
    format: baseJsonFormat,
    transports,
    // Don't exit on handled exceptions
    exitOnError: false,
    // Handle uncaught exceptions (app crashes) - separate from HTTP errors
    exceptionHandlers: [
      new winston.transports.DailyRotateFile({
        filename: join(logsDir, 'uncaught-exceptions-%DATE%.json'),
        datePattern: DATE_PATTERN,
        maxSize: '20m',
        maxFiles: '14d',
        format: baseJsonFormat,
        options: {
          flags: 'a',
          highWaterMark: 64 * 1024,
        },
      }),
    ],
    // Handle unhandled promise rejections - separate from HTTP errors
    rejectionHandlers: [
      new winston.transports.DailyRotateFile({
        filename: join(logsDir, 'rejections-%DATE%.json'),
        datePattern: DATE_PATTERN,
        maxSize: '20m',
        maxFiles: '14d',
        format: baseJsonFormat,
        options: {
          flags: 'a',
          highWaterMark: 64 * 1024,
        },
      }),
    ],
  };
};

// That's it! No more complexity. One logger rules them all! 🎯
