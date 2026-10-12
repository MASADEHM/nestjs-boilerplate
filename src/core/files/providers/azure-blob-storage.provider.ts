import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { FILE_TYPE_CONFIG } from '@core/files/constants';
import {
  AzureBlobConfig,
  MulterFile,
  StorageProvider,
  StorageResult,
  UploadOptions,
} from '@core/files/types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

/** this is not tested yet */
/** is public  logic need to be implemented*/
@Injectable()
export class AzureBlobStorageProvider implements StorageProvider {
  private static readonly ERROR_NOT_CONFIGURED =
    'Azure Blob Storage not configured' as const;

  private readonly logger = new Logger(AzureBlobStorageProvider.name);
  private readonly blobServiceClient: BlobServiceClient | null;
  private readonly defaultContainer: string;

  constructor(private readonly configService: ConfigService) {
    const config: AzureBlobConfig = {
      connectionString:
        this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING') ?? '',
      defaultContainer:
        this.configService.get<string>('AZURE_STORAGE_DEFAULT_CONTAINER') ??
        'files',
    };

    if (config.connectionString === '') {
      this.blobServiceClient = null;
      this.defaultContainer = config.defaultContainer;
    } else {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        config.connectionString
      );
      this.defaultContainer = config.defaultContainer;
    }
  }

  public async upload(
    file: MulterFile,
    options?: UploadOptions
  ): Promise<StorageResult> {
    if (this.blobServiceClient == null) {
      throw new Error(AzureBlobStorageProvider.ERROR_NOT_CONFIGURED);
    }

    if (options?.type == null) {
      throw new Error('File type is required for upload');
    }

    const container = this.defaultContainer;
    const typeConfig = FILE_TYPE_CONFIG[options.type];

    // Generate unique filename if requested
    const fileName =
      options.generateUniqueName === true
        ? `${uuidv4()}-${file.originalname}`
        : file.originalname;

    // Build blob path with type-specific folder structure
    const blobName = `${typeConfig.relativePath}/${fileName}`;

    // Get container client
    const containerClient: ContainerClient =
      this.blobServiceClient.getContainerClient(container);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'container', // or 'blob' for blob-level access
    });

    // Upload file
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(file.buffer, file.size, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      file_path: blobName, // Full path including folder structure
      file_name: fileName,
      is_public: options.isPublic,
    };
  }

  public async delete(filePath: string, _isPublic: boolean): Promise<boolean> {
    try {
      if (this.blobServiceClient == null) {
        throw new Error(AzureBlobStorageProvider.ERROR_NOT_CONFIGURED);
      }

      const container = this.defaultContainer;
      const containerClient =
        this.blobServiceClient.getContainerClient(container);
      const blockBlobClient = containerClient.getBlockBlobClient(filePath);

      await blockBlobClient.delete();
      return true;
    } catch (error) {
      this.logger.error('Error deleting blob:', error);
      return false;
    }
  }

  public getUrl(filePath: string, _isPublic: boolean): string {
    if (this.blobServiceClient == null) {
      throw new Error(AzureBlobStorageProvider.ERROR_NOT_CONFIGURED);
    }

    const containerName = this.defaultContainer;
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);

    return blockBlobClient.url;
  }

  public async getBuffer(
    filePath: string,
    _isPublic: boolean
  ): Promise<Buffer> {
    if (this.blobServiceClient == null) {
      throw new Error(AzureBlobStorageProvider.ERROR_NOT_CONFIGURED);
    }

    try {
      const containerName = this.defaultContainer;
      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filePath);

      const downloadResponse = await blockBlobClient.download();
      const chunks: Buffer[] = [];

      if (downloadResponse.readableStreamBody != null) {
        for await (const chunk of downloadResponse.readableStreamBody) {
          // Ensure chunk is converted to Buffer
          const buffer = chunk instanceof Buffer ? chunk : Buffer.from(chunk);
          chunks.push(buffer);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error('Error downloading file from Azure:', error);
      throw new Error(`Failed to download file: ${filePath}`);
    }
  }

  public async exists(filePath: string, _isPublic: boolean): Promise<boolean> {
    try {
      if (this.blobServiceClient == null) {
        throw new Error(AzureBlobStorageProvider.ERROR_NOT_CONFIGURED);
      }
      const containerName = this.defaultContainer;
      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(filePath);

      const response = await blobClient.exists();
      return response;
    } catch (error) {
      this.logger.error('Error checking blob existence:', error);
      return false;
    }
  }
}
