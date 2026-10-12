import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TempFileCleanupService } from './temp-file-cleanup.service';

/**
 * Files Cron Service
 * Handles scheduled tasks for file-related operations
 */
@Injectable()
export class FilesCronService {
  private readonly logger = new Logger(FilesCronService.name);

  constructor(
    private readonly tempFileCleanupService: TempFileCleanupService
  ) {}

  /**
   * Hourly cron job: Cleanup temporary files older than 2 hours
   * Runs every hour to keep storage clean
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'hourly-temp-file-cleanup',
    timeZone: 'Asia/Dubai',
  })
  public async handleHourlyTempFileCleanup(): Promise<void> {
    const startTime = new Date();
    this.logger.log(
      '🧹 Starting hourly temporary file cleanup cron job at ',
      startTime
    );

    try {
      // Get stats before cleanup
      const statsBefore = await this.tempFileCleanupService.getTempFileStats();

      if (statsBefore.expiredTempFiles === 0) {
        this.logger.log('✅ No expired temporary files found for cleanup');
        return;
      }

      this.logger.log(
        `📊 Before cleanup: ${statsBefore.totalTempFiles} total temp files, ${statsBefore.expiredTempFiles} expired, ${(statsBefore.totalSizeBytes / 1024 / 1024).toFixed(2)} MB total size`
      );

      // Run the cleanup
      const result = await this.tempFileCleanupService.runFullCleanup();

      if (result.success) {
        this.logger.log(
          `✅ Hourly temp file cleanup completed successfully: ${result.deletedFiles} files deleted from ${result.processedFiles} processed`
        );
      } else {
        this.logger.error(
          `⚠️ Hourly temp file cleanup completed with errors: ${result.errors.length} errors`
        );
        result.errors.forEach((error) => {
          this.logger.error(`   - ${error}`);
        });
      }

      // Get stats after cleanup
      const statsAfter = await this.tempFileCleanupService.getTempFileStats();
      const savedSpaceMB =
        (statsBefore.totalSizeBytes - statsAfter.totalSizeBytes) / 1024 / 1024;

      if (savedSpaceMB > 0) {
        this.logger.log(
          `💾 Freed up ${savedSpaceMB.toFixed(2)} MB of storage space`
        );
      }
    } catch (error) {
      this.logger.error('❌ Hourly temp file cleanup cron job failed:', error);
    }
  }

  /**
   * Manual method to trigger temp file cleanup
   * Useful for testing or manual intervention
   */
  public async triggerManualCleanup(): Promise<void> {
    this.logger.log('🔧 Manual temp file cleanup triggered');
    await this.handleHourlyTempFileCleanup();
  }

  /**
   * Get current temporary file statistics
   * Useful for monitoring and debugging
   */
  public async getTempFileStatistics(): Promise<{
    totalTempFiles: number;
    expiredTempFiles: number;
    totalSizeBytes: number;
    totalSizeMB: number;
    oldestFileDate: Date | null;
    oldestFileAgeHours: number | null;
  }> {
    const stats = await this.tempFileCleanupService.getTempFileStats();

    let oldestFileAgeHours: number | null = null;
    if (stats.oldestFileDate != null) {
      const ageMs = Date.now() - stats.oldestFileDate.getTime();
      oldestFileAgeHours = Math.floor(ageMs / (1000 * 60 * 60));
    }

    return {
      ...stats,
      totalSizeMB: Math.round((stats.totalSizeBytes / 1024 / 1024) * 100) / 100,
      oldestFileAgeHours,
    };
  }
}
