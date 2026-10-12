import * as path from 'node:path';

import { CommonModule } from '@common/common.module';
import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Global cron job scheduling
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 15, // 15 requests per second
      },
      {
        name: 'medium',
        ttl: 60_000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, 'core/i18n/locales'),
        watch: process.env.NODE_ENV !== 'production',
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // ?lang=en
        AcceptLanguageResolver, // Accept-Language header
        new HeaderResolver(['x-lang']),
      ],
      // Only generate types in development
      ...(process.env.NODE_ENV !== 'production' && {
        typesOutputPath: path.join(
          process.cwd(),
          'src/core/i18n/generated/i18n.generated.ts'
        ),
      }),
    }),
    CommonModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
