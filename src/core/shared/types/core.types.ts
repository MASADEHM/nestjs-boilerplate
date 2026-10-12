/**
 * Core System Interfaces
 *
 * These interfaces define fundamental contracts used throughout the application.
 * They represent system-wide concerns, not business domain logic.
 */

import type { HttpException } from '@nestjs/common';

/**
 * Base entity interface for all database entities
 */
export interface BaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  REFRESH_TOKEN_EXPIRES_IN?: string;
  CORS_ORIGIN?: string;
  ADMIN_BASE_URL?: string;
}

/**
 * Application context for global services
 */
export interface AppContext {
  correlationId: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

/**
 * Health check response interface
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'up' | 'down';
    redis?: 'up' | 'down';
  };
}

/**
 * HTTP Exception with additional metadata for enhanced error handling
 */
export interface ExceptionWithMetadata extends HttpException {
  errorCode?: string;
  details?: unknown;
  validationErrors?: unknown;
}
