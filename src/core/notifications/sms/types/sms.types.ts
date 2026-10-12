// NOTE: Replace with custom enum when implementing SMS verification
export enum VerificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface SmsMessage {
  to: string;
  from?: string;
  message: string;
  templateId?: string;
  variables?: Record<string, unknown>;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SmsProviderConfig {
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
  region?: string;
  [key: string]: unknown;
}

export interface OtpSmsData {
  phoneNumber: string;
  otpCode: string;
  expiryMinutes: number;
  appName?: string;
  templateVariables?: Record<string, unknown>;
}

export interface SmsProvider {
  name: string;
  sendSms: (message: SmsMessage) => Promise<SmsResponse>;
  sendOtp: (data: OtpSmsData) => Promise<SmsResponse>;
  validatePhoneNumber: (phoneNumber: string) => boolean;
}

export interface VerificationSmsOptions {
  channel: VerificationChannel;
  phoneNumber: string;
  userId: number;
  templateVariables?: Record<string, unknown>;
}

export interface SmsTemplateData {
  templateId: string;
  variables: Record<string, unknown>;
  defaultMessage?: string;
}
