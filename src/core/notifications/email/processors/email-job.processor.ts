import { JobType, QUEUE_NAMES } from '@core/jobs/types/job.types';
import {
  EmailPayload,
  TemplateMap,
} from '@core/notifications/email/constants/email.constants';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { EmailService } from '../services/email.service';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailJobProcessor {
  private readonly logger = new Logger(EmailJobProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process(JobType.EMAIL_NOTIFICATION)
  public async handleEmailJob(
    job: Job<EmailPayload<keyof TemplateMap>>
  ): Promise<void> {
    const { to, subject } = job.data;
    const toAddress = Array.isArray(to) ? to.join(', ') : to;

    this.logger.log(`Processing email job: ${subject} to ${toAddress}`);

    try {
      await this.emailService.send(job.data);

      this.logger.log(`✅ Email sent successfully to: ${toAddress}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${toAddress}:`, error);
      throw error;
    }
  }
}
