import { ConfigModule } from '@core/config/config.module';
import { JobsModule } from '@core/jobs/jobs.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

// Services
import { EmailProviderFactory } from './factories/email-provider.factory';
import { EmailJobProcessor } from './processors/email-job.processor';
import { MailgunEmailProvider } from './providers/mailgun.provider';
import { MiddlewareEmailProvider } from './providers/middleware.provider';
import { SendgridEmailProvider } from './providers/sendgrid.provider';
import { SmtpEmailProvider } from './providers/smtp.provider';
import { EmailQueueService } from './services/email-queue.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailService } from './services/email.service';

// Providers

// Processors

@Module({
  imports: [ConfigModule, JobsModule, HttpModule],
  providers: [
    // Core Services
    EmailService,
    EmailTemplateService,
    EmailQueueService,

    // Email Providers
    SmtpEmailProvider,
    SendgridEmailProvider,
    MailgunEmailProvider,
    MiddlewareEmailProvider,
    EmailProviderFactory,

    // Job Processors
    EmailJobProcessor,
  ],
  exports: [EmailService, EmailQueueService, JobsModule],
})
export class EmailModule {}
