import { Injectable, Logger } from '@nestjs/common';

import { SMS_ERRORS } from '../constants/sms.constants';
import { SmsProviderFactory } from '../factories/sms-provider.factory';
import { SmsMessage, SmsResponse } from '../types/sms.types';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly smsProviderFactory: SmsProviderFactory) {}

  /**
   * Send a basic SMS message
   */
  public async sendSms(message: SmsMessage): Promise<SmsResponse> {
    try {
      const provider = this.smsProviderFactory.getProvider();

      // Validate phone number
      if (!provider.validatePhoneNumber(message.to)) {
        return {
          success: false,
          error: SMS_ERRORS.INVALID_PHONE_NUMBER,
        };
      }

      return await provider.sendSms(message);
    } catch (error) {
      this.logger.error(
        'Failed to send SMS',
        error instanceof Error ? error.stack : String(error)
      );
      return {
        success: false,
        error: SMS_ERRORS.SEND_FAILED,
      };
    }
  }

  /**
   * Validate phone number format
   */
  public validatePhoneNumber(phoneNumber: string): boolean {
    const provider = this.smsProviderFactory.getProvider();
    return provider.validatePhoneNumber(phoneNumber);
  }

  /**
   * Get available SMS providers
   */
  public getAvailableProviders(): string[] {
    return this.smsProviderFactory.getAvailableProviders();
  }

  /**
   * Check if SMS service is properly configured
   */
  public isConfigured(): boolean {
    try {
      const provider = this.smsProviderFactory.getProvider();
      return provider.isConfigured();
    } catch (error) {
      this.logger.error(
        'Failed to check SMS configuration',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }
}
