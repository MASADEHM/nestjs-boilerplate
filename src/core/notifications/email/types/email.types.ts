import type { EMAIL_PROVIDERS } from '../constants/email.constants';

export type EmailProvider =
  (typeof EMAIL_PROVIDERS)[keyof typeof EMAIL_PROVIDERS];

export interface BaseEmailData {
  to: string;
  subject: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName?: string;
}

export interface MiddlewareConfig {
  apiUrl: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName?: string;
}

export interface EmailConfig {
  provider: EmailProvider;
  smtp?: SmtpConfig;
  sendgrid?: SendGridConfig;
  mailgun?: MailgunConfig;
  middleware?: MiddlewareConfig;
}
