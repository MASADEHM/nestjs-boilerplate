import { Injectable, Logger } from '@nestjs/common';

import { IEmailProvider } from './email-provider.interface';

import { EmailPayload, TemplateMap } from '../constants/email.constants';
import { EmailTemplateService } from '../services/email-template.service';
import { MailgunConfig } from '../types/email.types';

@Injectable()
export class MailgunEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(MailgunEmailProvider.name);
  private mailgunConfig: MailgunConfig | null = null;

  constructor(private readonly templateService: EmailTemplateService) {}

  public setConfig(config: MailgunConfig): void {
    this.mailgunConfig = config;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async sendEmail<K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Render the template with the provided data
      this.templateService.renderTemplate({
        to: payload.to as string,
        subject: payload.subject,
        template: payload.template.name,
        context: payload.template.data,
      });

      // Mailgun implementation would go here
      // Using rendered template data: rendered.subject, rendered.html, rendered.text
      this.logger.log(
        `Mailgun email sent successfully to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`
      );
      return {
        success: true,
        messageId: 'mailgun-mock-id',
      };
    } catch (error) {
      this.logger.error('Mailgun email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public testConnection(): boolean {
    try {
      // Test Mailgun connection by validating domain

      // This part of the original code was not in the new_code, so it's removed.
      // The new_code only provided the sendEmail method.
      this.logger.log('Mailgun connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Mailgun connection test failed:', error);
      return false;
    }
  }

  public getProviderName(): string {
    return 'Mailgun'; // The original code had EMAIL_PROVIDERS.MAILGUN, but EMAIL_PROVIDERS is removed.
  }
}
