import type { OtpSmsData, SmsMessage, SmsResponse } from '../types/sms.types';

export interface ISmsProvider {
  readonly name: string;

  /**
   * Send a basic SMS message
   */
  sendSms: (message: SmsMessage) => Promise<SmsResponse>;

  /**
   * Send an OTP SMS with predefined template
   */
  sendOtp: (data: OtpSmsData) => Promise<SmsResponse>;

  /**
   * Validate phone number format
   */
  validatePhoneNumber: (phoneNumber: string) => boolean;

  /**
   * Check if provider is properly configured
   */
  isConfigured: () => boolean;
}
