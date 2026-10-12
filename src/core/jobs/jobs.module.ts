import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ConfigService } from '@core/config/config.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

import { JobQueueService } from './services/job-queue.service';
import { JOB_CONFIG, JOB_ROUTES, QUEUE_NAMES } from './types/job.types';

/**
 * Jobs Module - Centralized Job Queue Management
 *
 * Uses Bull for robust job processing with Redis backend
 * Bull Board dashboard available at /admin/jobs/board (requires basic auth from env vars)
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.redisConfig,
        defaultJobOptions: {
          removeOnComplete: JOB_CONFIG.DEFAULT_REMOVE_ON_COMPLETE,
          removeOnFail: JOB_CONFIG.DEFAULT_REMOVE_ON_FAIL,
          attempts: JOB_CONFIG.DEFAULT_ATTEMPTS,
          backoff: {
            type: 'exponential',
            delay: JOB_CONFIG.DEFAULT_BACKOFF_DELAY,
          },
        },
      }),
    }),

    // Register individual queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.DEFAULT },
      { name: QUEUE_NAMES.EMAIL },
      {
        name: QUEUE_NAMES.NS_SUBMISSION,
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 successful jobs for monitoring
          removeOnFail: 50, // Keep last 50 failed jobs for debugging
          attempts: 5, // Retry failed jobs up to 5 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5s, then 10s, 20s, 40s, 80s
          },
          // Job delay settings - no delay by default
          delay: 0,
        },
      },
      {
        name: QUEUE_NAMES.CERTIFICATE_GENERATION,
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 successful jobs
          removeOnFail: 50, // Keep last 50 failed jobs for debugging
          attempts: 3, // Total 3 attempts (original + 2 retries)
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds, then 25s, 125s
          },
          delay: 1000, // 1 second delay by default
        },
      }
    ),

    // Bull Board Dashboard with Basic Authentication from Environment Variables
    // Route is excluded from global prefix in main.ts to prevent path-to-regexp warnings
    // Access at: /admin/jobs/board (NOT /api/admin/jobs/board)
    BullBoardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        route: JOB_ROUTES.BULL_BOARD_DASHBOARD,
        adapter: ExpressAdapter,
        middleware: basicAuth({
          challenge: true,
          users: {
            [configService.bullBoardUsername]: configService.bullBoardPassword,
          },
          unauthorizedResponse: (_req: unknown) => ({
            message: 'Bull Board Access Denied',
            hint: `Use username: ${configService.bullBoardUsername}, password: [check BULL_BOARD_PASSWORD env var]`,
            error: 'UNAUTHORIZED',
            statusCode: 401,
          }),
        }),
      }),
    }),

    // Register queues with Bull Board
    BullBoardModule.forFeature({
      name: QUEUE_NAMES.DEFAULT,
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAMES.EMAIL,
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAMES.NS_SUBMISSION,
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAMES.CERTIFICATE_GENERATION,
      adapter: BullAdapter,
    }),
  ],
  controllers: [],
  providers: [
    JobQueueService,
    // Processors will be added when implemented
    // EmailProcessor,
    // BookingProcessor,
  ],
  exports: [JobQueueService],
})
export class JobsModule {}
