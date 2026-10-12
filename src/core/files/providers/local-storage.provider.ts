import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { FILE_CONSTANTS } from '@core/files/constants';
import {
  extractStoragePathAfterVisibilityFolder,
  getFilesDirectory,
} from '@core/files/helpers/file-path.helper';
import {
  MulterFile,
  StorageProvider,
  StorageResult,
  UploadOptions,
} from '@core/files/types';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor() {
    // Directory creation will be handled on first upload
  }

  public async upload(
    file: MulterFile,
    options?: UploadOptions
  ): Promise<StorageResult> {
    // options.isPublic is required, so this should always be provided
    // But to match interface signature, we make it optional and throw if missing
    if (options == null) {
      throw new Error('UploadOptions are required, specifically isPublic');
    }
    // Ensure uploads directory exists
    const uploadsDir = await this.ensureAndGetUploadsDirectory(options);

    // Generate unique filename if requested
    const fileName =
      options.generateUniqueName === true
        ? `${uuidv4()}-${file.originalname}`
        : file.originalname;

    // Use the full path from originalname (which may include folder structure)
    const fullPath = path.join(uploadsDir, fileName);
    const targetDir = path.dirname(fullPath);

    // Ensure target directory exists
    // Path is validated: targetDir is derived from validated uploadsDir and sanitized fileName
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(targetDir, { recursive: true });

    // Write file to disk
    // Path is validated: fullPath is constructed from validated uploadsDir and sanitized fileName
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(fullPath, file.buffer);

    // Extract the path after public/private folder for database storage
    const relativePath = extractStoragePathAfterVisibilityFolder(
      fullPath,
      options.isPublic
    );

    return {
      file_path: relativePath, // Include directory structure: tenancy-contract/contracts/filename.pdf
      file_name: path.basename(fileName),
      is_public: options.isPublic,
    };
  }

  public async delete(filePath: string, isPublic: boolean): Promise<boolean> {
    try {
      const uploadsDir = getFilesDirectory({ isPublic });
      const fullPath = path.join(uploadsDir, filePath);
      // Path is validated: fullPath is constructed from validated uploadsDir and sanitized filePath
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      return false;
    }
  }

  public getUrl(filePath: string, isPublic: boolean): string {
    // Only return public URLs for files in public folders
    if (isPublic) {
      const url = `${FILE_CONSTANTS.PUBLIC_URL_PREFIX}${filePath.replace(
        `${getFilesDirectory({ isPublic })}/`,
        ''
      )}`;
      return url;
    }

    // For private files, return a protected API endpoint
    throw new Error(
      'Private files cannot be accessed via direct URL. Use secure download endpoint.'
    );
  }

  public async getBuffer(filePath: string, isPublic: boolean): Promise<Buffer> {
    try {
      const uploadsDir = getFilesDirectory({ isPublic });
      const fullPath = path.join(uploadsDir, filePath);
      // Path is validated: fullPath is constructed from validated uploadsDir and sanitized filePath
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      return await fs.readFile(fullPath);
    } catch (error) {
      this.logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  public async exists(filePath: string, isPublic: boolean): Promise<boolean> {
    try {
      const uploadsDir = getFilesDirectory({ isPublic });
      const fullPath = path.join(uploadsDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureAndGetUploadsDirectory(
    options: UploadOptions
  ): Promise<string> {
    const uploadsDir = getFilesDirectory(options);
    try {
      await fs.access(uploadsDir);
    } catch {
      // Path is validated: uploadsDir is generated from controlled getFilesDirectory helper
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  }
}
