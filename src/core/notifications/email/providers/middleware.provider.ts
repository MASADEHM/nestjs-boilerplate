import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { IEmailProvider } from './email-provider.interface';

import { EmailPayload, TemplateMap } from '../constants/email.constants';
import { EmailTemplateService } from '../services/email-template.service';
import { MiddlewareConfig } from '../types/email.types';

@Injectable()
export class MiddlewareEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(MiddlewareEmailProvider.name);
  private middlewareConfig: MiddlewareConfig | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly templateService: EmailTemplateService
  ) {}

  public async sendEmail<K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      if (this.middlewareConfig == null) {
        throw new Error('Middleware provider not properly configured');
      }

      // Render the template with the provided data
      const rendered = this.templateService.renderTemplate({
        to: payload.to as string,
        subject: payload.subject,
        template: payload.template.name,
        context: payload.template.data,
      });

      // Prepare the from field
      const fromField =
        this.middlewareConfig.fromName != null &&
        this.middlewareConfig.fromName !== ''
          ? `${this.middlewareConfig.fromName} <${this.middlewareConfig.fromEmail}>`
          : this.middlewareConfig.fromEmail;

      // Prepare the payload for middleware API
      const middlewarePayload = {
        to: payload.to,
        subject: rendered.subject,
        content: rendered.html, // Use HTML content
        from: fromField,
      };

      // Create basic auth header
      const authHeader = Buffer.from(
        `${this.middlewareConfig.username}:${this.middlewareConfig.password}`
      ).toString('base64');

      // Make HTTP POST request to middleware API
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.middlewareConfig.apiUrl}/api/v1/email/send`,
          middlewarePayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${authHeader}`,
            },
            timeout: 30_000, // 30 seconds timeout
          }
        )
      );

      this.logger.log(
        `Middleware email sent successfully to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`
      );

      const responseData = response.data as { messageId?: string } | undefined;
      return {
        success: true,
        messageId: responseData?.messageId ?? `middleware-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error('Middleware email sending failed:', error);

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
            typeof response.status === 'number'
              ? String(response.status)
              : 'Unknown';
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

  public async testConnection(): Promise<boolean> {
    if (this.middlewareConfig == null) {
      return false;
    }

    try {
      // Test the connection by making a simple request to the base URL
      const authHeader = Buffer.from(
        `${this.middlewareConfig.username}:${this.middlewareConfig.password}`
      ).toString('base64');

      await firstValueFrom(
        this.httpService.get(this.middlewareConfig.apiUrl, {
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
          timeout: 10_000, // 10 seconds timeout for test
        })
      );

      this.logger.log('Middleware connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Middleware connection test failed:', error);
      return false;
    }
  }

  public getProviderName(): string {
    return 'MIDDLEWARE';
  }

  public setConfig(config: MiddlewareConfig): void {
    this.middlewareConfig = config;
    this.logger.log('Middleware provider configured');
  }
}
