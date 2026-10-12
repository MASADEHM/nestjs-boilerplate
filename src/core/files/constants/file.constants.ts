/**
 * Constants for file management
 */

import { FileUploadType } from '@core/files/types';
import {
  FILE_EXTENSION_CONSTANTS,
  FILE_EXTENSION_GROUPS,
  FILE_MIME_GROUPS,
  FILE_SIZE_CONSTANTS,
  MIME_TYPE_CONSTANTS,
} from '@core/files/types/file-validation.types';

import type { FileTypeConfig } from '@core/files/types/file-validation.types';

const UPLOADS_DIRECTORY = 'uploads/';
export const FILE_CONSTANTS = {
  // uploads Directory , where all files are stored
  PUBLIC_DIRECTORY_PATH: `${UPLOADS_DIRECTORY}public/`,
  PRIVATE_DIRECTORY_PATH: `${UPLOADS_DIRECTORY}private/`,
  PUBLIC_URL_PREFIX: '/public/',
} as const;

const TENANCY_CONTRACT = 'tenancy-contract';
const MARINA = 'marina';

// File type configuration mapping with validation rules
export const FILE_TYPE_CONFIG: Record<FileUploadType, FileTypeConfig> = {
  [FileUploadType.AVATAR]: {
    isPublic: true,
    relativePath: 'avatars',
    validation: {
      maxSizeBytes: FILE_SIZE_CONSTANTS.AVATAR_MAX_SIZE,
      minSizeBytes: FILE_SIZE_CONSTANTS.MIN_FILE_SIZE,
      allowedMimeTypes: FILE_MIME_GROUPS.IMAGE,
      allowedExtensions: FILE_EXTENSION_GROUPS.IMAGE,
      maxDimensions: {
        width: 2048,
        height: 2048,
      },
      minDimensions: {
        width: 100,
        height: 100,
      },
      validateImageDimensions: true,
    },
  },
  [FileUploadType.TENANCY_CONTRACT_CONTRACTS]: {
    isPublic: false,
    relativePath: `${TENANCY_CONTRACT}/contracts`,
    validation: {
      maxSizeBytes: FILE_SIZE_CONSTANTS.CONTRACT_MAX_SIZE,
      minSizeBytes: FILE_SIZE_CONSTANTS.MIN_FILE_SIZE,
      allowedMimeTypes: [
        MIME_TYPE_CONSTANTS.PDF,
        MIME_TYPE_CONSTANTS.DOC,
        MIME_TYPE_CONSTANTS.DOCX,
      ] as string[],
      allowedExtensions: [
        FILE_EXTENSION_CONSTANTS.PDF,
        FILE_EXTENSION_CONSTANTS.DOC,
        FILE_EXTENSION_CONSTANTS.DOCX,
      ] as string[],
      validateImageDimensions: false,
    },
  },
  [FileUploadType.TENANCY_CONTRACT_ATTACHMENT]: {
    isPublic: false,
    relativePath: `${TENANCY_CONTRACT}/attachments`,
    validation: {
      maxSizeBytes: FILE_SIZE_CONSTANTS.ATTACHMENT_MAX_SIZE,
      minSizeBytes: FILE_SIZE_CONSTANTS.MIN_FILE_SIZE,
      allowedMimeTypes: [] as string[],
      allowedExtensions: [] as string[],
      validateImageDimensions: false,
    },
  },
  [FileUploadType.MARINA_IMAGES]: {
    isPublic: true,
    relativePath: `${MARINA}/images`,
    validation: {
      maxSizeBytes: FILE_SIZE_CONSTANTS.MARINA_IMAGE_MAX_SIZE,
      minSizeBytes: FILE_SIZE_CONSTANTS.MIN_FILE_SIZE,
      allowedMimeTypes: FILE_MIME_GROUPS.IMAGE,
      allowedExtensions: FILE_EXTENSION_GROUPS.IMAGE,
      maxDimensions: {
        width: 4096,
        height: 4096,
      },
      minDimensions: {
        width: 200,
        height: 200,
      },
      validateImageDimensions: true,
    },
  },
} as const;
