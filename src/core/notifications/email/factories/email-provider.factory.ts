import { EMAIL_PROVIDERS } from '@core/notifications/email/constants/email.constants';
import { IEmailProvider } from '@core/notifications/email/providers/email-provider.interface';
import { MailgunEmailProvider } from '@core/notifications/email/providers/mailgun.provider';
import { MiddlewareEmailProvider } from '@core/notifications/email/providers/middleware.provider';
import { SendgridEmailProvider } from '@core/notifications/email/providers/sendgrid.provider';
import { SmtpEmailProvider } from '@core/notifications/email/providers/smtp.provider';
import { EmailConfig } from '@core/notifications/email/types/email.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailProviderFactory {
  constructor(
    private readonly smtpProvider: SmtpEmailProvider,
    private readonly sendgridProvider: SendgridEmailProvider,
    private readonly mailgunProvider: MailgunEmailProvider,
    private readonly middlewareProvider: MiddlewareEmailProvider
  ) {}

  public createProvider(config: EmailConfig): IEmailProvider {
    switch (config.provider) {
      case EMAIL_PROVIDERS.SMTP:
        if (config.smtp == null) {
          throw new Error('email.smtpConfigRequired');
        }
        this.smtpProvider.setConfig(config.smtp);
        return this.smtpProvider;

      case EMAIL_PROVIDERS.SENDGRID:
        if (config.sendgrid == null) {
          throw new Error('email.sendgridConfigRequired');
        }
        this.sendgridProvider.setConfig(config.sendgrid);
        return this.sendgridProvider;

      case EMAIL_PROVIDERS.MAILGUN:
        if (config.mailgun == null) {
          throw new Error('email.mailgunConfigRequired');
        }
        this.mailgunProvider.setConfig(config.mailgun);
        return this.mailgunProvider;

      case EMAIL_PROVIDERS.MIDDLEWARE:
        if (config.middleware == null) {
          throw new Error('email.middlewareConfigRequired');
        }
        this.middlewareProvider.setConfig(config.middleware);
        return this.middlewareProvider;

      default:
        throw new Error('email.providerNotSupported');
    }
  }
}
