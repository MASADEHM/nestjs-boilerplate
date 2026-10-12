import { AuthModule } from '@core/auth/auth.module';
import { ConfigModule } from '@core/config/config.module';
import { DatabaseModule } from '@core/database/database.module';
import { FilesModule } from '@core/files/files.module';
import { HealthModule } from '@core/health/health.module';
import { JobsModule } from '@core/jobs/jobs.module';
import { NotificationsModule } from '@core/notifications/notifications.module';
import { SharedModule } from '@core/shared/shared.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SharedModule,
    AuthModule,
    FilesModule,
    HealthModule,
    JobsModule,
    NotificationsModule,
  ],
  exports: [
    ConfigModule,
    DatabaseModule,
    SharedModule,
    AuthModule,
    FilesModule,
    HealthModule,
    JobsModule,
    NotificationsModule,
  ],
})
export class CoreModule {}
