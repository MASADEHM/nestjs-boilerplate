import { ConfigService } from '@core/config/config.service';
import {
  EmailPayload,
  TemplateMap,
} from '@core/notifications/email/constants/email.constants';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

import {
  JOB_CONFIG,
  JobOptions,
  JobPriority,
  JobType,
  QUEUE_NAMES,
  NSSubmissionJobData,
  CertificateGenerationJobData,
} from '../types/job.types';

/**
 * Centralized Job Queue Service
 * Manages all background jobs across the application
 */
@Injectable()
export class JobQueueService {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DEFAULT) private readonly defaultQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NS_SUBMISSION)
    private readonly nsSubmissionQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CERTIFICATE_GENERATION)
    private readonly certificateQueue: Queue,
    private readonly configService: ConfigService
  ) {
    this.logger.log('Job Queue Service initialized');
  }

  /**
   * Add email job to queue
   */
  public async addEmailJob<K extends keyof TemplateMap>(
    payload: EmailPayload<K>,
    options: JobOptions = {}
  ): Promise<void> {
    const jobOptions = {
      priority: options.priority ?? JobPriority.MEDIUM,
      attempts: options.attempts ?? JOB_CONFIG.DEFAULT_ATTEMPTS,
      backoff: options.backoff ?? {
        type: 'exponential' as const,
        delay: JOB_CONFIG.DEFAULT_BACKOFF_DELAY,
      },
      removeOnComplete:
        options.removeOnComplete ?? JOB_CONFIG.DEFAULT_REMOVE_ON_COMPLETE,
      removeOnFail: options.removeOnFail ?? JOB_CONFIG.DEFAULT_REMOVE_ON_FAIL,
      ...options,
    };

    await this.emailQueue.add(JobType.EMAIL_NOTIFICATION, payload, jobOptions);
  }

  /**
   * Add NS submission job
   */
  public async addNSSubmissionJob(
    data: NSSubmissionJobData,
    options: JobOptions = {}
  ): Promise<Job<NSSubmissionJobData>> {
    return this.nsSubmissionQueue.add(
      JobType.NS_SUBMISSION,
      data,
      options
    ) as Promise<Job<NSSubmissionJobData>>;
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(): Promise<{
    default: {
      name: string;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      total: number;
    };
    email: {
      name: string;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      total: number;
    };
    booking: {
      name: string;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      total: number;
    };
  }> {
    const [defaultStats, emailStats, bookingStats] = await Promise.all([
      this.getQueueStat(this.defaultQueue),
      this.getQueueStat(this.emailQueue),
      this.getQueueStat(this.nsSubmissionQueue),
    ]);

    return {
      default: defaultStats,
      email: emailStats,
      booking: bookingStats,
    };
  }

  /**
   * Type guard to ensure we have arrays
   */
  private getArrayLength(arr: unknown): number {
    return Array.isArray(arr) ? arr.length : 0;
  }

  /**
   * Get individual queue statistics
   */
  private async getQueueStat(queue: Queue): Promise<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  }> {
    const [waiting, active, completed, failed, delayed]: unknown[] =
      await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

    const waitingCount = this.getArrayLength(waiting);
    const activeCount = this.getArrayLength(active);
    const completedCount = this.getArrayLength(completed);
    const failedCount = this.getArrayLength(failed);
    const delayedCount = this.getArrayLength(delayed);

    return {
      name: queue.name,
      waiting: waitingCount,
      active: activeCount,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
      total:
        waitingCount +
        activeCount +
        completedCount +
        failedCount +
        delayedCount,
    };
  }

  /**
   * Clean old jobs from queues
   */
  public async cleanQueues(): Promise<void> {
    const queues = [this.defaultQueue, this.emailQueue, this.nsSubmissionQueue];

    for (const queue of queues) {
      await queue.clean(24 * 60 * 60 * 1000, 'completed'); // Remove completed jobs older than 24h
      await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Remove failed jobs older than 7 days
    }

    this.logger.log('Queue cleanup completed');
  }

  /**
   * Add certificate generation job
   */
  public async addCertificateGenerationJob(
    data: CertificateGenerationJobData,
    options: JobOptions = {}
  ): Promise<Job<CertificateGenerationJobData>> {
    return this.certificateQueue.add(
      JobType.CERTIFICATE_GENERATION,
      {
        ...data,
        metadata: {
          ...data.metadata,
          triggeredAt: new Date(),
        },
      },
      options
    ) as Promise<Job<CertificateGenerationJobData>>;
  }

  /**
   * Get NS submission queue instance
   * Exposed for NS-specific operations (getJob, pause, resume, etc.)
   */
  public getNSSubmissionQueue(): Queue<NSSubmissionJobData> {
    return this.nsSubmissionQueue as Queue<NSSubmissionJobData>;
  }

  /**
   * Get certificate generation queue instance
   * Exposed for certificate-specific operations (getJob, pause, resume, etc.)
   */
  public getCertificateQueue(): Queue<CertificateGenerationJobData> {
    return this.certificateQueue as Queue<CertificateGenerationJobData>;
  }
}
