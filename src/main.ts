import { join } from 'node:path';

import { ConfigService } from '@core/config/config.service';
import { createWinstonLogger } from '@core/config/logging.config';
import { FILE_CONSTANTS } from '@core/files/constants/file.constants';
import { TrimStringsPipe } from '@core/shared/pipes/trim-strings.pipe';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Stats } from 'node:fs';

async function bootstrap(): Promise<void> {
  // Create Winston logger for file-based logging
  const winstonLogger = createWinstonLogger();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const logger = new Logger('Bootstrap application');

  // Serve only public files statically (private files like contracts are served through authenticated endpoints)
  const staticPath = join(process.cwd(), FILE_CONSTANTS.PUBLIC_DIRECTORY_PATH);

  app.useStaticAssets(staticPath, {
    prefix: FILE_CONSTANTS.PUBLIC_URL_PREFIX,
    setHeaders: (res: Response, _path: string, _stat: Stats) => {
      // Add CORS headers to static assets for frontend access
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
    },
  });

  // Set global API prefix (exclude Bull Board routes)
  // Bull Board must be excluded to prevent path-to-regexp warnings from its internal wildcard routes
  app.setGlobalPrefix('api', {
    exclude: ['admin/jobs'],
  });

  // Global pipes for validation and transformation
  app.useGlobalPipes(
    new TrimStringsPipe(), // Trim whitespace from all string inputs
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: false, // Allow additional properties for complex query params
    })
  );
  // Enable CORS
  app.enableCors({
    origin: configService.corsAllowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const { port } = configService;
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
