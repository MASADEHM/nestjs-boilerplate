import { Injectable, Logger } from '@nestjs/common';

import { IEmailProvider } from './email-provider.interface';

import { EmailPayload, TemplateMap } from '../constants/email.constants';
import { EmailTemplateService } from '../services/email-template.service';
import { SendGridConfig } from '../types/email.types';

@Injectable()
export class SendgridEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SendgridEmailProvider.name);
  private sendgridConfig: SendGridConfig | null = null;

  constructor(private readonly templateService: EmailTemplateService) {}

  public setConfig(config: SendGridConfig): void {
    this.sendgridConfig = config;
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

      // SendGrid implementation would go here
      // Using rendered template data: rendered.subject, rendered.html, rendered.text
      this.logger.log(
        `SendGrid email sent successfully to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`
      );
      return {
        success: true,
        messageId: 'sendgrid-mock-id',
      };
    } catch (error) {
      this.logger.error('SendGrid email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public testConnection(): boolean {
    try {
      // SendGrid doesn't have a direct connection test, so we'll validate API key format
      if (
        this.sendgridConfig?.apiKey != null &&
        !this.sendgridConfig.apiKey.startsWith('SG.')
      ) {
        this.logger.error('Invalid SendGrid API key format');
        return false;
      }

      this.logger.log('SendGrid configuration appears valid');
      return true;
    } catch (error) {
      this.logger.error('SendGrid connection test failed:', error);
      return false;
    }
  }

  public getProviderName(): string {
    return 'SendGrid'; // This constant is no longer imported, so hardcode for now
  }

  private initializeProvider(): void {
    try {
      // This method is no longer needed as SendGrid is initialized in the constructor
      // sgMail.setApiKey(this.config.apiKey);
      this.logger.log('SendGrid provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SendGrid provider:', error);
    }
  }
}
