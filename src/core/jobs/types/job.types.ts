/**
 * Job Queue System Types
 * Centralized job management for the entire application
 */

// Queue Names
export const QUEUE_NAMES = {
  DEFAULT: 'default',
  EMAIL: 'email',
  NS_SUBMISSION: 'ns-submission',
  CERTIFICATE_GENERATION: 'certificate-generation',
} as const;

// Job Queue Routes
export const JOB_ROUTES = {
  // Bull Board dashboard route (excluded from global prefix - full path without /api)
  BULL_BOARD_DASHBOARD: 'admin/jobs/board',
} as const;

// Job Queue Configuration Constants
export const JOB_CONFIG = {
  DEFAULT_REMOVE_ON_COMPLETE: 50,
  DEFAULT_REMOVE_ON_FAIL: 50,
  DEFAULT_ATTEMPTS: 3,
  DEFAULT_BACKOFF_DELAY: 2000,
  PAYMENT_EXPIRY_ATTEMPTS: 2,
  PAYMENT_EXPIRY_REMOVE_ON_COMPLETE: 100,
  PAYMENT_EXPIRY_REMOVE_ON_FAIL: 100,
  BOOKING_REMINDER_ATTEMPTS: 2,
  BOOKING_REMINDER_REMOVE_ON_COMPLETE: 50,
  BOOKING_REMINDER_REMOVE_ON_FAIL: 50,
} as const;

// Job Types for Queue System
export enum JobType {
  PAYMENT_STATUS_CHECK = 'payment_status_check',
  EMAIL_NOTIFICATION = 'email_notification',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_CLEANUP = 'booking_cleanup',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  NS_SUBMISSION = 'ns_submission',
  CERTIFICATE_GENERATION = 'generate-certificate',
}

// Job Priorities
export enum JobPriority {
  CRITICAL = 10,
  HIGH = 7,
  MEDIUM = 5,
  LOW = 2,
  BACKGROUND = 0,
}

// Job Options Interface
export interface JobOptions {
  jobId?: string; // Optional job ID for deduplication
  priority?: JobPriority | number; // Can be JobPriority enum or number
  delay?: number; // Delay in milliseconds
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: number;
  removeOnFail?: number;
}

// Job Data Interfaces

export interface NSSubmissionJobData {
  initialApprovalId: number;
  requestId: number;
  requestNo: string;
  approvedBy: string;
  approvedAt: Date;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface CertificateGenerationJobData {
  initialApprovalId: number;
  requestId: number;
  requestNo: string;
  nsReferenceNumber: string;
  priority: 'normal' | 'high';
  metadata?: {
    triggeredBy?: string;
    triggeredAt?: Date;
    retryAttempt?: number;
  };
}

// Job Result Interface
export interface JobResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  processedAt: Date;
}

// Cron Job Result Interface
export interface CronJobResult {
  jobName: string;
  success: boolean;
  processedCount: number;
  errorCount: number;
  duration: number; // milliseconds
  message?: string;
  errors?: string[];
  startTime: Date;
  endTime: Date;
}
