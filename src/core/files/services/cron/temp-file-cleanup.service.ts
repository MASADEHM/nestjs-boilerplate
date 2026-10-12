import { PrismaService } from '@core/database/services/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

import { StorageProviderFactory } from '../../factories/storage-provider.factory';
import { StorageProvider } from '../../types';

/**
 * Temporary File Cleanup Service
 * Handles cleanup of temporary files older than 2 hours
 */
@Injectable()
export class TempFileCleanupService {
  private readonly logger = new Logger(TempFileCleanupService.name);
  private readonly storageProvider: StorageProvider;

  constructor(
    private readonly prisma: PrismaService,
    storageProviderFactory: StorageProviderFactory
  ) {
    // Get storage provider from factory (uses environment configuration)
    this.storageProvider = storageProviderFactory.getProvider();
  }

  /**
   * Run full cleanup of temporary files older than 2 hours
   */
  public async runFullCleanup(): Promise<{
    success: boolean;
    deletedFiles: number;
    processedFiles: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let deletedFiles = 0;
    let processedFiles = 0;

    try {
      // Get temporary files older than 2 hours
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const tempFiles = await this.prisma.files.findMany({
        where: {
          is_temp: true,
          is_deleted: false,
          created_at: { lt: twoHoursAgo },
        },
      });

      processedFiles = tempFiles.length;

      if (tempFiles.length === 0) {
        return {
          success: true,
          deletedFiles: 0,
          processedFiles: 0,
          errors: [],
        };
      }

      // Delete each file
      for (const file of tempFiles) {
        try {
          // Delete from storage
          await this.storageProvider.delete(file.file_path, file.is_public);

          // Soft delete from database
          await this.prisma.files.update({
            where: { id: file.id },
            data: { is_deleted: true },
          });
          deletedFiles++;
        } catch (error) {
          const errorMessage = `Failed to delete file ${file.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          this.logger.error(errorMessage, error);
        }
      }

      return {
        success: errors.length === 0,
        deletedFiles,
        processedFiles,
        errors,
      };
    } catch (error) {
      this.logger.error('Error during temp file cleanup:', error);
      return {
        success: false,
        deletedFiles,
        processedFiles,
        errors: [
          `Cleanup failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        ],
      };
    }
  }

  /**
   * Get temporary file statistics
   */
  public async getTempFileStats(): Promise<{
    totalTempFiles: number;
    expiredTempFiles: number;
    totalSizeBytes: number;
    oldestFileDate: Date | null;
  }> {
    try {
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const [totalTempFiles, expiredTempFiles, expiredFiles, totalSizeResult] =
        await Promise.all([
          this.prisma.files.count({
            where: { is_temp: true, is_deleted: false },
          }),
          this.prisma.files.count({
            where: {
              is_temp: true,
              is_deleted: false,
              created_at: { lt: twoHoursAgo },
            },
          }),
          this.prisma.files.findMany({
            where: {
              is_temp: true,
              is_deleted: false,
              created_at: { lt: twoHoursAgo },
            },
            orderBy: { created_at: 'asc' },
            take: 1,
          }),
          this.prisma.files.aggregate({
            where: {
              is_temp: true,
              is_deleted: false,
            },
            _sum: {
              file_size: true,
            },
          }),
        ]);

      const totalSizeBytes = totalSizeResult._sum.file_size ?? 0;
      const oldestFileDate =
        expiredFiles.length > 0 ? expiredFiles[0].created_at : null;

      return {
        totalTempFiles,
        expiredTempFiles,
        totalSizeBytes,
        oldestFileDate,
      };
    } catch (error) {
      this.logger.error('Error getting temp file stats:', error);
      return {
        totalTempFiles: 0,
        expiredTempFiles: 0,
        totalSizeBytes: 0,
        oldestFileDate: null,
      };
    }
  }
}
