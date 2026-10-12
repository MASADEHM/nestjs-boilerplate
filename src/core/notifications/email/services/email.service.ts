import { ConfigService } from '@core/config/config.service';
import {
  EMAIL_PROVIDERS,
  EmailPayload,
  TemplateMap,
} from '@core/notifications/email/constants/email.constants';
import { EmailProviderFactory } from '@core/notifications/email/factories/email-provider.factory';
import { IEmailProvider } from '@core/notifications/email/providers/email-provider.interface';
import {
  EmailConfig,
  EmailProvider,
} from '@core/notifications/email/types/email.types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailProvider: IEmailProvider | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailProviderFactory: EmailProviderFactory
  ) {
    this.initializeProvider();
  }

  /**
   * 🎯 THE ONLY METHOD YOU NEED!
   * Send any email with type-safe template data
   */
  public async send<K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ): Promise<boolean> {
    try {
      if (this.emailProvider === null) {
        throw new Error('email.providerNotConfigured');
      }

      const { to, template } = payload;
      const recipients = Array.isArray(to) ? to : [to];

      // Process each recipient
      for (const recipient of recipients) {
        // Create individual payload for each recipient
        const recipientPayload = {
          ...payload,
          to: recipient,
        };

        // Send using the configured provider with type-safe payload
        const result = await this.emailProvider.sendEmail(recipientPayload);

        if (!result.success) {
          throw new Error(result.error ?? 'email.sendFailed');
        }

        this.logger.log(
          `✅ Email sent to ${recipient} using template: ${template.name}`
        );
      }

      return true;
    } catch (error) {
      this.logger.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Check if email service is configured
   */
  public isConfigured(): boolean {
    return this.emailProvider !== null;
  }

  /**
   * Get available email providers
   */
  public getAvailableProviders(): string[] {
    return Object.values(EMAIL_PROVIDERS);
  }

  /**
   * Initialize email provider
   */
  private initializeProvider(): void {
    try {
      const emailConfig = this.buildEmailConfig();
      this.emailProvider =
        this.emailProviderFactory.createProvider(emailConfig);
      this.logger.log(`Email provider initialized: ${emailConfig.provider}`);
    } catch (error) {
      this.logger.error('Failed to initialize email provider:', error);
    }
  }

  /**
   * Build email configuration from environment variables
   */
  private buildEmailConfig(): EmailConfig {
    const providerName = this.configService.emailProvider;
    const provider = providerName as EmailProvider;

    const config: EmailConfig = { provider };

    switch (provider) {
      case EMAIL_PROVIDERS.SMTP: {
        const { smtpConfig } = this.configService;
        if (
          smtpConfig.host == null ||
          smtpConfig.host === '' ||
          smtpConfig.port == null
        ) {
          throw new Error('email.smtpConfigMissing');
        }
        config.smtp = {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user ?? '',
          pass: smtpConfig.pass ?? '',
          auth:
            smtpConfig.user != null &&
            smtpConfig.user.trim() !== '' &&
            smtpConfig.pass != null &&
            smtpConfig.pass.trim() !== ''
              ? { user: smtpConfig.user, pass: smtpConfig.pass }
              : undefined,
        };
        break;
      }
      case EMAIL_PROVIDERS.SENDGRID: {
        const { sendgridConfig } = this.configService;
        if (
          sendgridConfig.apiKey == null ||
          sendgridConfig.apiKey === '' ||
          sendgridConfig.fromEmail == null ||
          sendgridConfig.fromEmail === ''
        ) {
          throw new Error('email.sendgridConfigMissing');
        }
        config.sendgrid = {
          apiKey: sendgridConfig.apiKey,
          fromEmail: sendgridConfig.fromEmail,
          fromName: sendgridConfig.fromName,
        };
        break;
      }
      case EMAIL_PROVIDERS.MAILGUN: {
        const { mailgunConfig } = this.configService;
        if (
          mailgunConfig.apiKey == null ||
          mailgunConfig.apiKey === '' ||
          mailgunConfig.domain == null ||
          mailgunConfig.domain === '' ||
          mailgunConfig.fromEmail == null ||
          mailgunConfig.fromEmail === ''
        ) {
          throw new Error('email.mailgunConfigMissing');
        }
        config.mailgun = {
          apiKey: mailgunConfig.apiKey,
          domain: mailgunConfig.domain,
          fromEmail: mailgunConfig.fromEmail,
          fromName: mailgunConfig.fromName,
        };
        break;
      }
      case EMAIL_PROVIDERS.MIDDLEWARE: {
        const { middlewareConfig } = this.configService;
        if (
          middlewareConfig.apiUrl == null ||
          middlewareConfig.apiUrl === '' ||
          middlewareConfig.username == null ||
          middlewareConfig.username === '' ||
          middlewareConfig.password == null ||
          middlewareConfig.password === '' ||
          middlewareConfig.fromEmail == null ||
          middlewareConfig.fromEmail === ''
        ) {
          throw new Error('email.middlewareConfigMissing');
        }
        config.middleware = {
          apiUrl: middlewareConfig.apiUrl,
          username: middlewareConfig.username,
          password: middlewareConfig.password,
          fromEmail: middlewareConfig.fromEmail,
          fromName: middlewareConfig.fromName,
        };
        break;
      }
      default:
        throw new Error('email.providerNotConfigured');
    }

    return config;
  }
}
