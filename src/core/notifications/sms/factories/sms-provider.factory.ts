import { CONFIG_KEYS } from '@core/config/config.keys';
import { ConfigService } from '@core/config/config.service';
import { Injectable, Logger } from '@nestjs/common';

import { SMS_CONSTANTS } from '../constants/sms.constants';
import { MiddlewareSmsProvider } from '../providers/middleware-sms.provider';
import { ISmsProvider } from '../providers/sms-provider.interface';

@Injectable()
export class SmsProviderFactory {
  private readonly logger = new Logger(SmsProviderFactory.name);
  private readonly providers = new Map<string, ISmsProvider>();

  constructor(
    private readonly configService: ConfigService,
    private readonly middlewareSmsProvider: MiddlewareSmsProvider
  ) {
    this.initializeProviders();
  }

  /**
   * Initialize available SMS providers
   */
  private initializeProviders(): void {
    // Register middleware provider (default for development)
    this.providers.set(
      SMS_CONSTANTS.PROVIDERS.MIDDLEWARE,
      this.middlewareSmsProvider
    );

    this.logger.log(`Initialized ${this.providers.size} SMS provider(s)`);
    this.providers.forEach((provider, name) => {
      this.logger.log(`📱 Registered SMS provider: ${name} (${provider.name})`);
    });
  }

  /**
   * Get the configured SMS provider
   */
  public getProvider(): ISmsProvider {
    const providerName = this.configService.get<string>(
      CONFIG_KEYS.SMS_PROVIDER,
      SMS_CONSTANTS.PROVIDERS.MIDDLEWARE
    );

    const provider = this.providers.get(providerName);

    if (provider == null) {
      this.logger.warn(
        `SMS provider '${providerName}' not found, falling back to middleware provider`
      );
      return this.middlewareSmsProvider;
    }

    if (!provider.isConfigured()) {
      this.logger.warn(
        `SMS provider '${providerName}' not properly configured, falling back to middleware provider`
      );
      return this.middlewareSmsProvider;
    }

    return provider;
  }

  /**
   * Get specific provider by name
   */
  public getProviderByName(name: string): ISmsProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Register a new SMS provider
   */
  public registerProvider(name: string, provider: ISmsProvider): void {
    this.providers.set(name, provider);
    this.logger.log(`📱 Registered new SMS provider: ${name}`);
  }

  /**
   * Get all available providers
   */
  public getAvailableProviders(): string[] {
    return [...this.providers.keys()];
  }
}
