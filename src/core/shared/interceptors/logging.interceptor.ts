import { randomUUID } from 'node:crypto';

import { LogLevel } from '@core/config/log-levels.enum';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger as WinstonLogger } from 'winston';

/**
 * Global Logging Interceptor
 *
 * Logs all HTTP requests and responses for monitoring and debugging.
 * This is a system-level concern, not business logic.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!this.shouldLog(request)) {
      return next.handle();
    }
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, headers } = request;
    const ip: string = String(request.ip ?? 'Unknown');
    const userAgent: string = String(headers['user-agent'] ?? 'Unknown');
    const startTime = Date.now();

    // Generate correlation ID for request tracking
    const correlationId = this.generateCorrelationId();
    headers['x-correlation-id'] = correlationId;

    // Return correlation ID in response headers for API clients
    response.setHeader('x-request-id', correlationId);

    // Log incoming request to access log
    this.logHttpAccess('incoming', {
      method,
      url,
      ip,
      userAgent,
      correlationId,
      statusCode: null,
      duration: null,
      error: '',
    });

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          // Log successful response to access log
          this.logHttpAccess('success', {
            method,
            url,
            ip,
            userAgent,
            correlationId,
            statusCode,
            duration,
            error: '',
          });
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;

          // Check actual exception type (statusCode isn't set yet by filter)
          let actualStatus = 500; // Default to server error

          if (error instanceof HttpException) {
            actualStatus = error.getStatus();
          }

          if (actualStatus >= 500) {
            // 500+ Critical system error → critical.json (EXCEPTION level)
            const message = `🚨 CRITICAL: ${method} ${url} | ${actualStatus} | ${duration}ms | Error: ${error.message} | Stack: ${error.stack ?? 'No stack'} | ID: ${correlationId}`;
            this.winstonLogger.log(LogLevel.EXCEPTION, message);
          } else {
            // 4xx Regular error (404, validation, etc.) → error.json (ERROR level)
            const message = `✗ ${method} ${url} | ${actualStatus} | ${duration}ms | Error: ${error.message} | ID: ${correlationId}`;
            this.winstonLogger.log(LogLevel.ERROR, message);
          }
        },
      })
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${randomUUID()}`;
  }

  // Removed sanitization - keep it simple for now! 🎯

  // Removed complexity - just use main logger for everything! 🎯

  private shouldLog(request: Request): boolean {
    const skipPaths = ['/health', '/api/health', '/metrics'];
    return !skipPaths.some((path) => request.url.includes(path));
  }

  /**
   * Simple HTTP logging - one method, zero complexity
   */
  private logHttpAccess(
    type: 'incoming' | 'success' | 'error',
    data: {
      method: string;
      url: string;
      ip: string;
      userAgent: string;
      correlationId: string;
      statusCode: number | null;
      duration: number | null;
      error: string;
    }
  ): void {
    const { method, url, correlationId, statusCode, duration, error } = data;

    let message: string;
    let level: LogLevel;

    switch (type) {
      case 'incoming':
        message = `→ ${method} ${url} | ID: ${correlationId}`;
        level = LogLevel.HTTP;
        break;
      case 'success':
        message = `← ${method} ${url} | ${statusCode} | ${duration}ms | ID: ${correlationId}`;
        level = LogLevel.HTTP;
        break;
      case 'error':
        message = `✗ ${method} ${url} | ${statusCode} | ${duration}ms | Error: ${error} | ID: ${correlationId}`;
        level = LogLevel.ERROR;
        break;
    }

    // One logger, appropriate level - Winston handles the rest!
    this.winstonLogger.log(level, message);
  }
}
