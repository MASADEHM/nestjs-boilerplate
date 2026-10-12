import { EMAIL_PROVIDERS } from '@core/notifications/email/constants/email.constants';
import { SMS_CONSTANTS } from '@core/notifications/sms/constants/sms.constants';
import * as joi from 'joi';

export const configValidationSchema = joi.object({
  // Database
  DATABASE_URL: joi.string().required(),

  // JWT
  JWT_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().default('1d'),

  // Server
  PORT: joi.number().default(3000),
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),

  // CORS & Frontend
  CORS_ALLOWED_ORIGINS: joi.string().default('http://localhost:4200'), // Comma-separated origins
  FRONTEND_URL: joi.string().uri().default('http://localhost:4200'),

  // Email Provider
  EMAIL_PROVIDER: joi
    .string()
    .valid(...Object.values(EMAIL_PROVIDERS))
    .default(EMAIL_PROVIDERS.SMTP),

  // Email (if using email service)
  SMTP_HOST: joi.string().optional(),
  SMTP_PORT: joi.number().optional(),
  SMTP_USER: joi.string().allow('').optional(), // Allow empty string for services like Mailpit
  SMTP_PASS: joi.string().allow('').optional(), // Allow empty string for services like Mailpit

  // SendGrid
  SENDGRID_API_KEY: joi.string().optional(),
  SENDGRID_FROM_EMAIL: joi.string().email().optional(),
  SENDGRID_FROM_NAME: joi.string().optional(),

  // Mailgun
  MAILGUN_API_KEY: joi.string().optional(),
  MAILGUN_DOMAIN: joi.string().optional(),
  MAILGUN_FROM_EMAIL: joi.string().email().optional(),
  MAILGUN_FROM_NAME: joi.string().optional(),

  // Middleware
  MIDDLEWARE_API_URL: joi.string().uri().optional(),
  MIDDLEWARE_USERNAME: joi.string().optional(),
  MIDDLEWARE_PASSWORD: joi.string().optional(),
  MIDDLEWARE_FROM_EMAIL: joi.string().email().optional(),
  MIDDLEWARE_FROM_NAME: joi.string().optional(),

  // SMS Provider
  SMS_PROVIDER: joi
    .string()
    .valid(...Object.values(SMS_CONSTANTS.PROVIDERS))
    .default(SMS_CONSTANTS.PROVIDERS.MIDDLEWARE),

  // File upload (if using cloud storage)
  AWS_REGION: joi.string().optional(),
  AWS_ACCESS_KEY_ID: joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: joi.string().optional(),
  AWS_S3_BUCKET: joi.string().optional(),

  // Redis - Job Queue System (mandatory)
  REDIS_HOST: joi.string().default('localhost'),
  REDIS_PORT: joi.number().default(6379),
  REDIS_PASSWORD: joi.string().allow('').optional(),
  REDIS_DB: joi.number().default(0),
  REDIS_TLS_ENABLED: joi.boolean().default(false),

  // Bull Board Dashboard Authentication
  BULL_BOARD_USERNAME: joi.string().default('admin'),
  BULL_BOARD_PASSWORD: joi.string().default('12345'),

  // Database Seeding Authentication
  DB_SEEDING_USERNAME: joi.string().default('admin'),
  DB_SEEDING_PASSWORD: joi.string().default('12345'),

  // UAE Pass Configuration
  UAE_PASS_CLIENT_ID: joi.string().optional(),
  UAE_PASS_CLIENT_SECRET: joi.string().optional(),
  UAE_PASS_BASE_URL: joi.string().optional(),
  UAE_PASS_SCOPE: joi.string().optional(),
  UAE_PASS_ACR_VALUES: joi.string().optional(),
  UAE_PASS_REDIRECT_URI: joi.string().optional(),
  UAE_PASS_MOBILE_REDIRECT_URI: joi.string().optional(),

  // API Rate Limiting
  THROTTLE_TTL: joi.number().optional(),
  THROTTLE_LIMIT: joi.number().optional(),

  // Files Service Configuration
  FILE_STORAGE_PROVIDER: joi.string().optional(),
  FILE_UPLOAD_PATH: joi.string().optional(),
  FILE_MAX_SIZE: joi.number().optional(),
  FILE_ALLOWED_TYPES: joi.string().optional(),
});
