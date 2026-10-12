import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

import { IEmailProvider } from './email-provider.interface';

import { EmailPayload, TemplateMap } from '../constants/email.constants';
import { EmailTemplateService } from '../services/email-template.service';
import { SmtpConfig } from '../types/email.types';

@Injectable()
export class SmtpEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private transporter: Transporter | null = null;
  private smtpConfig: SmtpConfig | null = null;

  constructor(private readonly templateService: EmailTemplateService) {}

  public async sendEmail<K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      if (this.transporter == null || this.smtpConfig == null) {
        throw new Error('SMTP provider not properly configured');
      }

      // Render the template with the provided data
      const rendered = this.templateService.renderTemplate({
        to: payload.to as string,
        subject: payload.subject,
        template: payload.template.name,
        context: payload.template.data,
      });

      const mailOptions = {
        from:
          this.smtpConfig.auth?.user != null &&
          this.smtpConfig.auth.user.trim() !== ''
            ? this.smtpConfig.auth.user
            : 'noreply@bizhub.com',
        to: payload.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `SMTP email sent successfully to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`
      );
      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        messageId: result.messageId as string,
      };
    } catch (error) {
      this.logger.error('SMTP email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async testConnection(): Promise<boolean> {
    if (this.transporter == null) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection test successful');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection test failed:', error);
      return false;
    }
  }

  public getProviderName(): string {
    return 'SMTP'; // This constant is removed, so hardcode for now
  }

  private initializeTransporter(): void {
    if (this.smtpConfig == null) {
      throw new Error('SMTP configuration not provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transporterOptions: any = {
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
    };

    // Only add auth if credentials are provided (not needed for Mailpit)
    if (this.smtpConfig.auth != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      transporterOptions.auth = {
        user: this.smtpConfig.auth.user,
        pass: this.smtpConfig.auth.pass,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.transporter = nodemailer.createTransport(transporterOptions);

    this.logger.log('SMTP transporter initialized');
  }

  public setConfig(config: SmtpConfig): void {
    this.smtpConfig = config;
    this.initializeTransporter();
  }
}
