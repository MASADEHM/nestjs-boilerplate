import { Module } from '@nestjs/common';

import { StorageProviderFactory } from './factories/storage-provider.factory';
import { FilesController } from './files.controller';
import { AzureBlobStorageProvider } from './providers/azure-blob-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import {
  FilesCronService,
  FilesService,
  FileValidationService,
  TempFileCleanupService,
} from './services';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    LocalStorageProvider,
    AzureBlobStorageProvider,
    StorageProviderFactory,
    FileValidationService,
    // Cron services
    FilesCronService,
    TempFileCleanupService,
  ],
  exports: [
    FilesService,
    FilesCronService,
    TempFileCleanupService,
    FileValidationService,
  ],
})
export class FilesModule {}
