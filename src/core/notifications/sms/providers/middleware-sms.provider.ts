import { randomUUID } from 'node:crypto';

import { ConfigService } from '@core/config/config.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { ISmsProvider } from './sms-provider.interface';

import { OtpSmsData, SmsMessage, SmsResponse } from '../types/sms.types';

@Injectable()
export class MiddlewareSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MiddlewareSmsProvider.name);

  public readonly name = 'middleware';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Send SMS via middleware API
   */
  public async sendSms(message: SmsMessage): Promise<SmsResponse> {
    try {
      const { middlewareConfig } = this.configService;

      if (
        middlewareConfig.apiUrl == null ||
        middlewareConfig.apiUrl === '' ||
        middlewareConfig.username == null ||
        middlewareConfig.username === '' ||
        middlewareConfig.password == null ||
        middlewareConfig.password === ''
      ) {
        this.logger.warn('Middleware not configured, falling back to logging');
        return this.logSms(message);
      }

      // Prepare the payload for middleware API
      const smsPayload = {
        mobile: message.to,
        message: message.message,
      };

      // Create basic auth header
      const authHeader = Buffer.from(
        `${middlewareConfig.username}:${middlewareConfig.password}`
      ).toString('base64');

      // Make HTTP POST request to middleware API
      const response = await firstValueFrom(
        this.httpService.post(
          `${middlewareConfig.apiUrl}/api/v1/sms/send`,
          smsPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${authHeader}`,
            },
            timeout: 30_000, // 30 seconds timeout
          }
        )
      );

      this.logger.log(`SMS sent successfully to ${message.to} via middleware`);

      const responseData = response.data as { messageId?: string } | undefined;
      return {
        success: true,
        messageId: responseData?.messageId ?? `middleware-${Date.now()}`,
        metadata: {
          provider: this.name,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Middleware SMS sending failed:', error);

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's an HTTP error from @nestjs/axios
        if ('response' in error && error.response != null) {
          const response = error.response as {
            status?: number;
            data?: { message?: string };
          };
          const status =
            response.status == null ? 'Unknown' : String(response.status);
          const dataMessage = response.data?.message ?? error.message;
          errorMessage = `HTTP ${status}: ${dataMessage}`;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Fallback method to log SMS when middleware is not configured
   */
  private logSms(message: SmsMessage): SmsResponse {
    this.logger.log(
      '📱 SMS Middleware Provider - Logging SMS (not configured)'
    );
    this.logger.log(`To: ${message.to}`);
    this.logger.log(`Message: ${message.message}`);

    return {
      success: true,
      messageId: `logged_${Date.now()}_${randomUUID()}`,
      metadata: {
        provider: this.name,
        timestamp: new Date().toISOString(),
        simulatedDelivery: true,
      },
    };
  }

  /**
   * Simulate sending OTP SMS
   */
  public async sendOtp(data: OtpSmsData): Promise<SmsResponse> {
    this.logger.log('🔐 SMS Middleware Provider - Sending OTP');
    this.logger.log(`Phone: ${data.phoneNumber}`);
    this.logger.log(`OTP Code: ${data.otpCode}`);
    this.logger.log(`Expires in: ${data.expiryMinutes} minutes`);
    this.logger.log(`App: ${data.appName ?? ''}`);

    const message = this.formatOtpMessage(data);

    return this.sendSms({
      to: data.phoneNumber,
      message,
      templateId: 'otp-verification',
      variables: data.templateVariables,
    });
  }

  /**
   * Basic phone number validation
   */
  public validatePhoneNumber(phoneNumber: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phoneNumber);

    this.logger.log(
      `📞 Phone validation for ${phoneNumber}: ${isValid ? 'VALID' : 'INVALID'}`
    );

    return isValid;
  }

  /**
   * Middleware provider is always "configured"
   */
  public isConfigured(): boolean {
    return true;
  }

  /**
   * Format OTP message template
   */
  private formatOtpMessage(data: OtpSmsData): string {
    const appName = data.appName ?? 'Marsa';
    return `Your ${appName} verification code is: ${data.otpCode}. This code will expire in ${data.expiryMinutes} minutes. Do not share this code with anyone.`;
  }
}
