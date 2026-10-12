import { FILE_CONSTANTS, FILE_TYPE_CONFIG } from '@core/files/constants';

import type { FileUploadType, UploadOptions } from '@core/files/types';

/**
 * Get the public files directory
 */

export function getPublicFilesDirectory(): string {
  return FILE_CONSTANTS.PUBLIC_DIRECTORY_PATH;
}

/**
 * Get the private files directory
 */
export function getPrivateFilesDirectory(): string {
  return FILE_CONSTANTS.PRIVATE_DIRECTORY_PATH;
}

export function getFilesDirectory(options: UploadOptions): string {
  if (options.type != null) {
    return getFilesDirectoryForSpecificType(options.type);
  }
  return options.isPublic
    ? getPublicFilesDirectory()
    : getPrivateFilesDirectory();
}

export function getFilesDirectoryForSpecificType(type: FileUploadType): string {
  // TypeScript guarantees FILE_TYPE_CONFIG has all FileUploadType keys as it's a Record
  const config = FILE_TYPE_CONFIG[type];
  const { isPublic, relativePath } = config;
  return isPublic
    ? FILE_CONSTANTS.PUBLIC_DIRECTORY_PATH + relativePath
    : FILE_CONSTANTS.PRIVATE_DIRECTORY_PATH + relativePath;
}

/**
 * Extract the storage path after public/private folder for database storage
 * Input: uploads/private/tenancy-contract/contracts/filename.pdf
 * Output: tenancy-contract/contracts/filename.pdf
 */
export function extractStoragePathAfterVisibilityFolder(
  fullPath: string,
  isPublic: boolean
): string {
  const baseDir = isPublic
    ? FILE_CONSTANTS.PUBLIC_DIRECTORY_PATH
    : FILE_CONSTANTS.PRIVATE_DIRECTORY_PATH;
  return fullPath.replace(baseDir, '').replaceAll('\\', '/');
}
