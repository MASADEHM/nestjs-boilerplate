import { FILE_TYPE_CONFIG } from '@core/files/constants';
import { FileUploadType, MulterFile } from '@core/files/types';
import {
  FileValidationOptions,
  FileValidationResult,
  FileValidationRule,
} from '@core/files/types/file-validation.types';
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';
import { ApiException } from '@core/shared/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import * as sharp from 'sharp';

// Pre-compiled regex patterns for performance optimization
const EXECUTABLE_PATTERNS = [
  // JavaScript patterns
  /<script[^>]*>[\S\s]*?<\/script>/gi,
  /javascript:/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /onerror\s*=/gi,
  /eval\s*\(/gi,
  /function\s*\(/gi,
  /settimeout\s*\(/gi,
  /setinterval\s*\(/gi,
  /document\.write/gi,
  /window\.open/gi,
  /location\.href/gi,

  // VBScript patterns
  /<script[^>]*language\s*=\s*["']vbscript["'][^>]*>/gi,
  /vbscript:/gi,

  // PowerShell patterns
  /powershell/gi,
  /cmd\.exe/gi,
  /\.ps1/gi,

  // Shell script patterns (more specific to avoid false positives)
  /^#!\/bin\/(bash|sh|zsh|python|perl)/gm, // Proper shebang at start of line
  /^#!\/usr\/bin\/(bash|sh|zsh|python|perl)/gm, // Proper shebang with usr/bin

  // Base64 encoded scripts
  /data:text\/html;base64/gi,
  /data:application\/javascript;base64/gi,

  // Common malware signatures
  /malware/gi,
  /trojan/gi,
  /virus/gi,
  /backdoor/gi,
  /keylogger/gi,
  /rootkit/gi,

  // Suspicious function calls
  /system\s*\(/gi,
  /exec\s*\(/gi,
  /shell_exec\s*\(/gi,
  /passthru\s*\(/gi,
  /popen\s*\(/gi,
  /proc_open\s*\(/gi,
] as const;

const PDF_MALICIOUS_PATTERNS = [
  // PDF JavaScript (more specific patterns)
  /\/js\s+\([^)]*\)/gi, // PDF JavaScript with content
  /\/javascript\s+\([^)]*\)/gi, // PDF JavaScript with content
  /\/openaction\s*<<[^>]*\/s\s*\/javascript/gi, // PDF auto-action with JavaScript
  /\/aa\s*<<[^>]*\/s\s*\/javascript/gi, // PDF additional actions with JavaScript

  // PDF Launch actions (suspicious)
  /\/launch\s*<<[^>]*\/f\s*\([^)]*\.(exe|bat|cmd|scr|pif|com)/gi,

  // PDF URI actions to executables
  /\/uri\s*<<[^>]*\/uri\s*\([^)]*\.(exe|bat|cmd|scr|pif|com)/gi,

  // PDF form submissions to suspicious URLs
  /\/submitform\s*<<[^>]*\/f\s*\([^)]*https?:\/\/\S+\.(exe|bat|cmd|scr|pif|com)/gi,

  // Embedded executable files
  /\/embeddedfile\s*<<[^>]*\/f\s*\([^)]*\.(exe|bat|cmd|scr|pif|com)/gi,
  /\/fileattachment\s*<<[^>]*\/f\s*\([^)]*\.(exe|bat|cmd|scr|pif|com)/gi,
] as const;

const IMAGE_MALICIOUS_PATTERNS = [
  // EXIF/XMP metadata with scripts
  /<xmp:createdate>.*<script/gi,
  /<xmp:modifydate>.*javascript:/gi,
  /<xmp:creatortool>.*<script/gi,
  /<xmp:metadatadate>.*javascript:/gi,

  // IPTC metadata
  /<iptc:.*<script/gi,

  // ICC profile with scripts
  /<icc:.*<script/gi,

  // Embedded HTML/JavaScript
  /<html/gi,
  /<script/gi,
  /javascript:/gi,

  // Base64 encoded scripts
  /data:text\/html;base64/gi,
  /data:application\/javascript;base64/gi,
] as const;

/**
 * File Validation Service
 * Handles comprehensive file validation including size, type, and image dimensions
 */
@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  /**
   * Validate a file against the specified file type configuration
   */
  public async validateFile(
    file: MulterFile,
    fileType: FileUploadType,
    options: FileValidationOptions = {},
    i18n: I18nContext<I18nTranslations>
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (file.size === 0) {
        return {
          isValid: false,
          errors: [i18n.t('files.validation.emptyFile')],
          warnings,
        };
      }
      // Get file type validation rules
      const rules = this.getValidationRules(fileType);

      // Merge custom validation rules if provided
      const validationRules = this.mergeValidationRules(
        rules,
        options.customRules
      );

      // Normalize MIME type and file extension to lowercase for edge-case safety
      const mime = file.mimetype.toLowerCase();
      const ext = this.extractFileExtension(file.originalname); // already lower-cases

      // Validate file size
      this.validateFileSize(file, validationRules, errors, i18n);

      // Validate MIME type
      this.validateMimeType(validationRules, errors, i18n, mime);

      // Validate file extension
      this.validateFileExtension(validationRules, errors, i18n, ext);

      // security validations
      this.validateFileSecurity(file, errors, i18n, mime, ext);

      // Validate image dimensions if required (after security checks)
      if (
        validationRules.validateImageDimensions === true &&
        mime.startsWith('image/') &&
        errors.length === 0
      ) {
        await this.validateImageDimensions(
          file,
          validationRules,
          errors,
          warnings,
          i18n
        );
      }

      const isValid = errors.length === 0;

      if (errors.length > 0) {
        this.logger.warn(
          `File validation failed for ${file.originalname}: ${errors.join(', ')}`
        );
      }

      return {
        isValid,
        errors,
        warnings,
      };
    } catch (error) {
      const e = error as Error;
      this.logger.error(`File validation error: ${e.message}`, e.stack);
      return { isValid: false, errors: [e.message], warnings: [] };
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(
    file: MulterFile,
    rules: FileValidationRule,
    errors: string[],
    i18n: I18nContext<I18nTranslations>
  ): void {
    const { size } = file;
    const { maxSizeBytes, minSizeBytes } = rules;

    if (size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
      errors.push(
        i18n.t('files.validation.sizeTooLarge', {
          args: {
            maxSize: maxSizeMB,
            fileSize: fileSizeMB,
          },
        })
      );
    }

    if (minSizeBytes != null && minSizeBytes > 0 && size < minSizeBytes) {
      const minSizeMB = (minSizeBytes / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (size / (1024 * 1024)).toFixed(2);
      errors.push(
        i18n.t('files.validation.sizeTooSmall', {
          args: {
            minSize: minSizeMB,
            fileSize: fileSizeMB,
          },
        })
      );
    }
  }

  /**
   * Validate MIME type
   */
  private validateMimeType(
    rules: FileValidationRule,
    errors: string[],
    i18n: I18nContext<I18nTranslations>,
    normalizedMime: string
  ): void {
    const { allowedMimeTypes } = rules;

    if (!allowedMimeTypes.includes(normalizedMime)) {
      errors.push(
        i18n.t('files.validation.invalidMimeType', {
          args: {
            mimeType: normalizedMime,
            allowedTypes: allowedMimeTypes.join(', '),
          },
        })
      );
    }
  }

  /**
   * Validate file extension
   */
  private validateFileExtension(
    rules: FileValidationRule,
    errors: string[],
    i18n: I18nContext<I18nTranslations>,
    normalizedExt: string
  ): void {
    const { allowedExtensions } = rules;

    if (!allowedExtensions.includes(normalizedExt)) {
      errors.push(
        i18n.t('files.validation.invalidExtension', {
          args: {
            extension: normalizedExt,
            allowedExtensions: allowedExtensions.join(', '),
          },
        })
      );
    }
  }

  /**
   * Validate image dimensions
   */
  private async validateImageDimensions(
    file: MulterFile,
    rules: FileValidationRule,
    errors: string[],
    warnings: string[],
    i18n: I18nContext<I18nTranslations>
  ): Promise<void> {
    try {
      const { buffer } = file;
      const { maxDimensions, minDimensions } = rules;

      const metadata = await sharp(buffer, {
        limitInputPixels: 100_000_000,
      }).metadata();
      // Sharp metadata width/height are typed as number | undefined
      // but TypeScript's type definitions may not reflect this accurately
      const width = metadata.width as number | undefined;
      const height = metadata.height as number | undefined;

      if (width === undefined || width === 0) {
        errors.push(i18n.t('files.validation.cannotReadImageDimensions'));
        return;
      }

      if (height === undefined || height === 0) {
        errors.push(i18n.t('files.validation.cannotReadImageDimensions'));
        return;
      }

      // Check maximum dimensions
      if (
        maxDimensions != null &&
        (width > maxDimensions.width || height > maxDimensions.height)
      ) {
        errors.push(
          i18n.t('files.validation.imageTooLarge', {
            args: {
              width,
              height,
              maxWidth: maxDimensions.width,
              maxHeight: maxDimensions.height,
            },
          })
        );
      }

      // Check minimum dimensions
      if (
        minDimensions != null &&
        (width < minDimensions.width || height < minDimensions.height)
      ) {
        errors.push(
          i18n.t('files.validation.imageTooSmall', {
            args: {
              width,
              height,
              minWidth: minDimensions.width,
              minHeight: minDimensions.height,
            },
          })
        );
      }
    } catch (error) {
      const e = error as Error;
      this.logger.error(
        `Failed to validate image dimensions for ${file.originalname}: ${e.message}`
      );
      errors.push(i18n.t('files.validation.imageProcessingError'));
    }
  }

  /**
   * Validate file security (basic security checks)
   */
  private validateFileSecurity(
    file: MulterFile,
    errors: string[],
    i18n: I18nContext<I18nTranslations>,
    normalizedMime: string,
    normalizedExt: string
  ): void {
    const { originalname } = file;

    // Check for suspicious file names
    if (this.isSuspiciousFileName(originalname)) {
      errors.push(i18n.t('files.validation.suspiciousFileName'));
    }

    // Check for executable files
    if (this.isExecutableFile(normalizedMime, normalizedExt)) {
      errors.push(i18n.t('files.validation.executableFileNotAllowed'));
    }

    // Check for malware/executable scripts in PDFs and images
    if (this.containsExecutableScript(file, normalizedMime)) {
      errors.push(i18n.t('files.validation.malwareDetected'));
    }

    // inside validateFileSecurity(...)
    if (Buffer.byteLength(originalname, 'utf8') > 255) {
      errors.push(i18n.t('files.validation.fileNameTooLong'));
    }
  }

  /**
   * Extract file extension from filename (normalized to lowercase)
   */
  private extractFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.slice(Math.max(0, lastDotIndex + 1)).toLowerCase();
  }

  /**
   * Check if filename is suspicious
   */
  private isSuspiciousFileName(filename: string): boolean {
    const base = filename.replace(/\.[^./]+$/, ''); // strip extension
    const invalidOnFull = [/\.\./, /["*:<>?|]/, /[./\\]\s*$/].some((p) =>
      p.test(filename)
    );
    const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base);
    return invalidOnFull || reserved;
  }

  /**
   * Check if file is executable
   */
  private isExecutableFile(mimetype: string, normalizedExt: string): boolean {
    const executableMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msdos-program',
      'application/x-winexe',
    ];

    const executableExtensions = [
      'exe',
      'bat',
      'cmd',
      'com',
      'scr',
      'pif',
      'vbs',
      'js',
      'mjs',
      'ts',
      'tsx',
      'jar',
      'app',
      'deb',
      'rpm',
      'msi',
      'apk',
      'dmg',
      'sh',
      'bash',
      'ps1',
      'php',
      'pl',
      'py',
    ];

    return (
      executableMimeTypes.includes(mimetype) ||
      executableExtensions.includes(normalizedExt)
    );
  }

  /**
   * Check if file contains executable scripts (malware detection)
   * Layered approach: generic patterns for text-like files, specific checks for PDFs/images
   */
  private containsExecutableScript(
    file: MulterFile,
    mimetype: string
  ): boolean {
    try {
      const { buffer, originalname } = file;

      const isPdf = mimetype === 'application/pdf';
      const isImage = mimetype.startsWith('image/');
      const isTextLike =
        mimetype.startsWith('text/') ||
        mimetype === 'application/xml' ||
        mimetype === 'image/svg+xml' ||
        isPdf; // include PDFs in general scan pass

      // 1) Fast general scan (only for text-like + PDFs)
      if (isTextLike) {
        const content = buffer.toString(
          'utf8',
          0,
          Math.min(buffer.length, 1024 * 1024)
        ); // Check first 1MB

        // Check for executable patterns using pre-compiled regex
        for (const pattern of EXECUTABLE_PATTERNS) {
          const { source } = pattern;
          if (pattern.test(content)) {
            this.logger.warn(
              `Malware pattern detected in ${originalname}: ${source}`
            );
            return true; // fast reject
          }
        }
      }

      // 2) Specific deep scans
      if (isPdf) return this.checkPdfForMaliciousContent(buffer);
      if (isImage) return this.checkImageForMaliciousContent(buffer);

      return false;
    } catch (error) {
      const e = error as Error;
      this.logger.error(
        `Error checking for malware in ${file.originalname}: ${e.message}`
      );
      return true; // fail-safe
    }
  }

  /**
   * Check PDF for malicious content
   */
  private checkPdfForMaliciousContent(buffer: Buffer): boolean {
    try {
      const content = buffer.toString(
        'latin1',
        0,
        Math.min(buffer.length, 2 * 1024 * 1024)
      ); // Check first 2MB

      for (const pattern of PDF_MALICIOUS_PATTERNS) {
        if (pattern.test(content)) {
          this.logger.warn(`PDF malicious pattern detected: ${pattern.source}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error checking PDF for malicious content: ${errorMessage}`
      );
      return true; // Return true on error to be safe
    }
  }

  /**
   * Check image for malicious content in metadata
   */
  private checkImageForMaliciousContent(buffer: Buffer): boolean {
    try {
      // Check for embedded scripts in image metadata
      const content = buffer.toString(
        'utf8',
        0,
        Math.min(buffer.length, 512 * 1024)
      ); // Check first 512KB

      for (const pattern of IMAGE_MALICIOUS_PATTERNS) {
        if (pattern.test(content)) {
          this.logger.warn(
            `Image malicious pattern detected: ${pattern.source}`
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error checking image for malicious content: ${errorMessage}`
      );
      return true; // Return true on error to be safe
    }
  }

  /**
   * Merge validation rules with custom overrides
   */
  private mergeValidationRules(
    baseRules: FileValidationRule,
    customRules?: Partial<FileValidationRule>
  ): FileValidationRule {
    if (customRules == null) {
      return baseRules;
    }
    return {
      ...baseRules,
      ...customRules,
      maxDimensions:
        customRules.maxDimensions == null
          ? baseRules.maxDimensions
          : { ...baseRules.maxDimensions, ...customRules.maxDimensions },
      minDimensions:
        customRules.minDimensions == null
          ? baseRules.minDimensions
          : { ...baseRules.minDimensions, ...customRules.minDimensions },
      allowedMimeTypes:
        customRules.allowedMimeTypes ?? baseRules.allowedMimeTypes,
      allowedExtensions:
        customRules.allowedExtensions ?? baseRules.allowedExtensions,
    };
  }

  /**
   * Get validation rules for a specific file type
   */
  public getValidationRules(fileType: FileUploadType): FileValidationRule {
    const fileConfig = FILE_TYPE_CONFIG[fileType];
    // TypeScript ensures fileConfig exists for valid FileUploadType keys
    // but we validate at runtime for safety
    if (!(fileType in FILE_TYPE_CONFIG)) {
      throw new Error(`Invalid file type: ${fileType}`);
    }
    return fileConfig.validation;
  }

  /**
   * Validate file with logging and error handling
   * This method wraps the basic validation and handles logging and error throwing
   */
  public async validateFileWithErrorHandling(
    file: MulterFile,
    type: FileUploadType,
    options: FileValidationOptions = {},
    i18n: I18nContext<I18nTranslations>
  ): Promise<void> {
    // Validate file before processing
    const validationResult = await this.validateFile(file, type, options, i18n);

    if (!validationResult.isValid) {
      this.logger.warn(
        `File validation failed for ${file.originalname}: ${validationResult.errors.join(', ')}`
      );
      throw ApiException.badRequest(
        i18n.t('files.validation.failed', {
          args: { errors: validationResult.errors.join(', ') },
        })
      );
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      this.logger.warn(
        `File validation warnings for ${file.originalname}: ${validationResult.warnings.join(', ')}`
      );
    }
  }
}
