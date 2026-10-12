import { AuditRequestInfo } from '@core/auth/decorators';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { AuditInfo } from '@core/auth/types/auth.types';
import { FileUploadType, MulterFile } from '@core/files/types/file.types';
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';
import { ResponseHelper } from '@core/shared/helpers/response.helper';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';

import { FilesService } from './services/files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: MulterFile,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Res() response: Response,
    @Query('type') type: FileUploadType,
    @AuditRequestInfo() auditInfo: AuditInfo
  ): Promise<void> {
    const result = await this.filesService.uploadFile(
      file,
      type,
      auditInfo,
      i18n
    );
    const message = i18n.t('files.uploaded');
    ResponseHelper.created(result, response, message);
  }

  @Get('secure/:fileId')
  @UseGuards(JwtAuthGuard)
  public async downloadSecureFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @AuditRequestInfo() auditInfo: AuditInfo,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Res() response: Response
  ): Promise<void> {
    const fileData = await this.filesService.downloadSecureFile(
      fileId,
      auditInfo,
      i18n
    );

    // Set appropriate headers for file download
    response.setHeader('Content-Type', fileData.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileData.originalName}"`
    );
    response.setHeader('Content-Length', fileData.buffer.length);
    response.setHeader('X-File-Original-Name', fileData.originalName);
    response.setHeader('X-File-Size', fileData.buffer.length.toString());
    response.setHeader('X-File-Type', fileData.mimeType);
    response.setHeader('X-File-Created-At', fileData.createdAt.toISOString());
    response.setHeader(
      'Access-Control-Expose-Headers',
      'x-file-original-name, x-file-size, x-file-type, x-file-created-at, content-disposition'
    );

    // Send the file buffer
    response.send(fileData.buffer);
  }
}
