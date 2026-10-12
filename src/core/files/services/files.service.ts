import { createAuditFields } from '@core/auth/helpers';
import { AuditInfo } from '@core/auth/types/auth.types';
import { PrismaService } from '@core/database/services/prisma.service';
import { FILE_TYPE_CONFIG } from '@core/files/constants';
import { FileTransformer } from '@core/files/dto';
import {
  FileUploadType,
  MulterFile,
  StorageProvider,
  StorageResult,
  UploadOptions,
} from '@core/files/types';
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';
import { ApiException } from '@core/shared/exceptions/api.exception';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Files } from '@prisma/client';
import { I18nContext } from 'nestjs-i18n';

import { FileValidationService } from './file-validation.service';

import { StorageProviderFactory } from '../factories/storage-provider.factory';

@Injectable()
export class FilesService {
  private readonly storageProvider: StorageProvider;
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    storageProviderFactory: StorageProviderFactory,
    private readonly fileValidationService: FileValidationService
  ) {
    // Get storage provider from factory (uses environment configuration)
    this.storageProvider = storageProviderFactory.getProvider();
  }

  public async saveFileToStorage(
    file: MulterFile,
    uploadOptions: UploadOptions
  ): Promise<StorageResult> {
    return this.storageProvider.upload(file, uploadOptions);
  }

  /**
   * Upload a file using the configured storage provider
   */
  public async uploadFile(
    file: MulterFile,
    type: FileUploadType,
    auditInfo: AuditInfo,
    i18n: I18nContext<I18nTranslations>
  ): Promise<FileTransformer> {
    // Validate file before processing
    await this.fileValidationService.validateFileWithErrorHandling(
      file,
      type,
      {},
      i18n
    );
    try {
      const config = FILE_TYPE_CONFIG[type];
      const auditFields = createAuditFields(auditInfo);

      // Upload file using the configured provider
      const uploadResult = await this.saveFileToStorage(file, {
        generateUniqueName: true,
        type,
        isPublic: config.isPublic,
      });

      // Save file metadata to database using Prisma
      const savedFile = await this.prisma.files.create({
        data: {
          type,
          original_name: file.originalname,
          file_path: uploadResult.file_path,
          is_public: uploadResult.is_public,
          is_temp: false,
          file_size: file.size,
          mime_type: file.mimetype,
          created_by: auditFields.created_by,
          updated_by: auditFields.updated_by,
        },
      });

      return FileTransformer.from(savedFile);
    } catch (error) {
      // Check if it's already an HttpException (validation errors from ApiException)
      if (error instanceof HttpException) {
        throw error; // Re-throw validation errors as-is (400)
      }

      // Only catch unexpected errors and convert to 500
      this.logger.error('Error uploading file:', error);
      const message = i18n.t('files.uploadFailed');
      throw ApiException.internalError(message);
    }
  }

  /**
   * Get file metadata by ID
   */
  public async getFileById(
    id: number,
    i18n: I18nContext<I18nTranslations>
  ): Promise<Files> {
    const file = await this.prisma.files.findFirst({
      where: { id, is_deleted: false },
    });

    if (file == null) {
      const message = i18n.t('files.notFound');
      throw ApiException.notFound(message);
    }

    // Type assertion: file is guaranteed to be non-null after the check above
    return file;
  }

  /**
   * Get file URL for download
   */
  public async getFileUrl(
    id: number,
    i18n: I18nContext<I18nTranslations>
  ): Promise<string> {
    const file = await this.getFileById(id, i18n);

    try {
      return this.storageProvider.getUrl(file.file_path, file.is_public);
    } catch (_error) {
      this.logger.error('Error getting file URL:', _error);
      const message = i18n.t('files.downloadFailed');
      throw ApiException.internalError(message);
    }
  }

  /**
   * Check if file exists in storage
   */
  public async exists(fileIdOrRecord: number | Files): Promise<boolean> {
    let file: Files;

    if (typeof fileIdOrRecord === 'number') {
      const fileRecord = await this.prisma.files.findFirst({
        where: { id: fileIdOrRecord, is_deleted: false },
      });
      if (fileRecord == null) return false;
      file = fileRecord;
    } else {
      file = fileIdOrRecord;
    }

    try {
      return await this.storageProvider.exists(file.file_path, file.is_public);
    } catch (error) {
      this.logger.error('Error checking file existence:', error);
      return false;
    }
  }

  /**
   * Get file buffer for secure download
   */
  public async getFileBuffer(
    id: number,
    i18n: I18nContext<I18nTranslations>
  ): Promise<Buffer> {
    const file = await this.getFileById(id, i18n);

    try {
      return await this.storageProvider.getBuffer(
        file.file_path,
        file.is_public
      );
    } catch (_error) {
      this.logger.error('Error getting file buffer:', _error);
      const message = i18n.t('files.downloadFailed');
      throw ApiException.internalError(message);
    }
  }

  /**
   * Delete a file
   */
  public async deleteFile(
    id: number,
    i18n: I18nContext<I18nTranslations>
  ): Promise<void> {
    const file = await this.getFileById(id, i18n);

    try {
      // Delete from storage
      await this.storageProvider.delete(file.file_path, file.is_public);

      // Soft delete from database
      await this.prisma.files.update({
        where: { id },
        data: { is_deleted: true },
      });
    } catch (_error) {
      this.logger.error('Error deleting file:', _error);
      const message = i18n.t('files.deletionFailed');
      throw ApiException.internalError(message);
    }
  }

  /**
   * Download secure file with access validation
   */
  public async downloadSecureFile(
    fileId: number,
    auditInfo: AuditInfo,
    i18n: I18nContext<I18nTranslations>
  ): Promise<{
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    createdAt: Date;
  }> {
    // Get file metadata (throws if not found)
    const file = await this.getFileById(fileId, i18n);

    // Get file buffer
    const buffer = await this.getFileBuffer(fileId, i18n);

    return {
      buffer,
      originalName: file.original_name,
      mimeType: file.mime_type,
      createdAt: file.created_at,
    };
  }
}
