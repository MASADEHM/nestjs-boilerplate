import { FILE_CONSTANTS } from '@core/files/constants';
import { setPropertiesFromData } from '@core/shared/helpers';

import type { Files } from '@prisma/client';

export class FileTransformer {
  public id: number;

  public original_name: string;

  public file_path: string;

  public file_size: number;

  public mime_type: string;

  public full_url: string | null;

  public is_public: boolean;

  public is_temp: boolean;

  public static from(file: Files): FileTransformer {
    const transformer = new FileTransformer();
    setPropertiesFromData(transformer, file);

    // Generate full download URL
    transformer.full_url = FileTransformer.generateFullUrl(file);

    return transformer;
  }

  public static fromMany(files: Files[]): FileTransformer[] {
    return files.map((file) => FileTransformer.from(file));
  }

  private static generateFullUrl(file: Files): string | null {
    if (!file.is_public) {
      return null;
    }
    const base = process.env.APP_URL ?? 'http://localhost:3000';
    const publicUrlPrefix = FILE_CONSTANTS.PUBLIC_URL_PREFIX;

    return `${base}${publicUrlPrefix}${file.file_path}`;
  }
}
