/**
 * File validation types and interfaces
 */

export interface FileValidationRule {
  /** Maximum file size in bytes */
  maxSizeBytes: number;
  /** Minimum file size in bytes */
  minSizeBytes?: number;
  /** Allowed MIME types */
  allowedMimeTypes: string[]; // empty array means all MIME types are allowed
  /** Allowed file extensions (without dot) */
  allowedExtensions: string[]; // empty array means all file extensions are allowed
  /** Maximum dimensions for images (width x height) */
  maxDimensions?: {
    width: number;
    height: number;
  };
  /** Minimum dimensions for images (width x height) */
  minDimensions?: {
    width: number;
    height: number;
  };
  /** Whether to validate image dimensions */
  validateImageDimensions?: boolean;
}

export interface FileTypeConfig {
  /** Whether the file is public or private */
  isPublic: boolean;
  /** Relative path within the storage directory */
  relativePath: string;
  /** File validation rules */
  validation: FileValidationRule;
}

export interface FileValidationResult {
  /** Whether the file is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Warnings if any */
  warnings: string[];
}

export interface FileValidationOptions {
  /** Custom validation rules to override defaults */
  customRules?: Partial<FileValidationRule>;
}

/**
 * Common file size constants
 */
export const FILE_SIZE_CONSTANTS = {
  // Image sizes
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MARINA_IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB

  // Document sizes
  CONTRACT_MAX_SIZE: 25 * 1024 * 1024, // 25MB
  ATTACHMENT_MAX_SIZE: 5 * 1024 * 1024, // 5MB

  // Minimum sizes
  MIN_FILE_SIZE: 1, // 1 byte minimum
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 10MB
} as const;

/**
 * Common MIME type constants
 */
export const MIME_TYPE_CONSTANTS = {
  // Image MIME types
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_SVG: 'image/svg+xml',
  IMAGE_WEBP: 'image/webp',
  IMAGE_GIF: 'image/gif',

  // Document MIME types
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT: 'text/plain',

  // Archive MIME types
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZIP: 'application/gzip',
} as const;

export const IMAGE_MIME_TYPES = [
  MIME_TYPE_CONSTANTS.IMAGE_JPEG,
  MIME_TYPE_CONSTANTS.IMAGE_PNG,
  MIME_TYPE_CONSTANTS.IMAGE_SVG,
  MIME_TYPE_CONSTANTS.IMAGE_WEBP,
  MIME_TYPE_CONSTANTS.IMAGE_GIF,
];

export const DOCUMENT_MIME_TYPES = [
  MIME_TYPE_CONSTANTS.PDF,
  MIME_TYPE_CONSTANTS.DOC,
  MIME_TYPE_CONSTANTS.DOCX,
  MIME_TYPE_CONSTANTS.XLS,
  MIME_TYPE_CONSTANTS.XLSX,
  MIME_TYPE_CONSTANTS.PPT,
  MIME_TYPE_CONSTANTS.PPTX,
  MIME_TYPE_CONSTANTS.TXT,
];

export const ARCHIVE_MIME_TYPES = [
  MIME_TYPE_CONSTANTS.ZIP,
  MIME_TYPE_CONSTANTS.RAR,
  MIME_TYPE_CONSTANTS.TAR,
  MIME_TYPE_CONSTANTS.GZIP,
];

export const FILE_MIME_GROUPS = {
  IMAGE: IMAGE_MIME_TYPES,
  DOCUMENT: DOCUMENT_MIME_TYPES,
  ARCHIVE: ARCHIVE_MIME_TYPES,
} as const;
export const FILE_EXTENSION_CONSTANTS = {
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  SVG: 'svg',
  WEBP: 'webp',
  GIF: 'gif',
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx',
  XLS: 'xls',
  XLSX: 'xlsx',
  PPT: 'ppt',
  PPTX: 'pptx',
  TXT: 'txt',
  ZIP: 'zip',
  RAR: 'rar',
  TAR: 'tar',
  GZIP: 'gz',
} as const;

// Image extensions
export const IMAGE_EXTENSIONS = [
  FILE_EXTENSION_CONSTANTS.JPG,
  FILE_EXTENSION_CONSTANTS.JPEG,
  FILE_EXTENSION_CONSTANTS.PNG,
  FILE_EXTENSION_CONSTANTS.SVG,
  FILE_EXTENSION_CONSTANTS.WEBP,
  FILE_EXTENSION_CONSTANTS.GIF,
];

// Document extensions
export const DOCUMENT_EXTENSIONS = [
  FILE_EXTENSION_CONSTANTS.PDF,
  FILE_EXTENSION_CONSTANTS.DOC,
  FILE_EXTENSION_CONSTANTS.DOCX,
  FILE_EXTENSION_CONSTANTS.XLS,
  FILE_EXTENSION_CONSTANTS.XLSX,
  FILE_EXTENSION_CONSTANTS.PPT,
  FILE_EXTENSION_CONSTANTS.PPTX,
  FILE_EXTENSION_CONSTANTS.TXT,
];

// Archive extensions
export const ARCHIVE_EXTENSIONS = [
  FILE_EXTENSION_CONSTANTS.ZIP,
  FILE_EXTENSION_CONSTANTS.RAR,
  FILE_EXTENSION_CONSTANTS.TAR,
  FILE_EXTENSION_CONSTANTS.GZIP,
];

export const FILE_EXTENSION_GROUPS = {
  IMAGE: IMAGE_EXTENSIONS,
  DOCUMENT: DOCUMENT_EXTENSIONS,
  ARCHIVE: ARCHIVE_EXTENSIONS,
} as const;
