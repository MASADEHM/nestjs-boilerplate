import { CONFIG_KEYS, ConfigKey } from '@core/config/config.keys';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import type { StringValue } from 'ms';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // Type-safe get method with autocompletion
  public get<T = string>(key: ConfigKey): T | undefined;
  public get<T = string>(key: ConfigKey, defaultValue: T): T;
  public get<T = string>(key: ConfigKey, defaultValue?: T): T | undefined {
    if (defaultValue !== undefined) {
      return this.configService.get<T>(key, defaultValue);
    }
    return this.configService.get<T>(key);
  }

  // Database
  public get databaseUrl(): string {
    const url = this.get<string>(CONFIG_KEYS.DATABASE_URL);
    if (url == null) {
      throw new Error('DATABASE_URL is not configured');
    }
    return url;
  }

  // JWT Configuration
  public get jwtSecret(): string {
    const secret =
      this.get<string>(CONFIG_KEYS.JWT_SECRET) ??
      ((): never => {
        throw new Error('JWT_SECRET is not configured');
      })();
    return secret;
  }

  public get jwtExpiresIn(): StringValue {
    return this.get<StringValue>(CONFIG_KEYS.JWT_EXPIRES_IN, '1d');
  }

  // Server
  public get port(): number {
    return this.get<number>(CONFIG_KEYS.PORT, 3000);
  }

  public get nodeEnv(): string {
    return this.get<string>(CONFIG_KEYS.NODE_ENV, 'development');
  }

  public get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  public get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  public get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  // CORS
  public get corsAllowedOrigins(): string[] {
    const origins = this.get<string>(
      CONFIG_KEYS.CORS_ALLOWED_ORIGINS,
      'http://localhost:5173'
    );
    return origins.split(',').map((origin) => origin.trim());
  }

  public get frontendUrl(): string {
    return this.get<string>(CONFIG_KEYS.FRONTEND_URL, 'http://localhost:5173');
  }

  // Email Configuration
  public get emailProvider(): string {
    return this.get<string>(CONFIG_KEYS.EMAIL_PROVIDER, 'smtp');
  }

  public get smtpConfig(): {
    host: string | undefined;
    port: number | undefined;
    secure: boolean;
    user: string | undefined;
    pass: string | undefined;
  } {
    return {
      host: this.get<string>(CONFIG_KEYS.SMTP_HOST),
      port: this.get<number>(CONFIG_KEYS.SMTP_PORT),
      secure: this.get<boolean>(CONFIG_KEYS.SMTP_SECURE, false),
      user: this.get<string>(CONFIG_KEYS.SMTP_USER),
      pass: this.get<string>(CONFIG_KEYS.SMTP_PASS),
    };
  }

  public get sendgridConfig(): {
    apiKey: string | undefined;
    fromEmail: string | undefined;
    fromName: string | undefined;
  } {
    return {
      apiKey: this.get<string>(CONFIG_KEYS.SENDGRID_API_KEY),
      fromEmail: this.get<string>(CONFIG_KEYS.SENDGRID_FROM_EMAIL),
      fromName: this.get<string>(CONFIG_KEYS.SENDGRID_FROM_NAME),
    };
  }

  public get mailgunConfig(): {
    apiKey: string | undefined;
    domain: string | undefined;
    fromEmail: string | undefined;
    fromName: string | undefined;
  } {
    return {
      apiKey: this.get<string>(CONFIG_KEYS.MAILGUN_API_KEY),
      domain: this.get<string>(CONFIG_KEYS.MAILGUN_DOMAIN),
      fromEmail: this.get<string>(CONFIG_KEYS.MAILGUN_FROM_EMAIL),
      fromName: this.get<string>(CONFIG_KEYS.MAILGUN_FROM_NAME),
    };
  }

  public get middlewareConfig(): {
    apiUrl: string | undefined;
    username: string | undefined;
    password: string | undefined;
    fromEmail: string | undefined;
    fromName: string | undefined;
  } {
    return {
      apiUrl: this.get<string>(CONFIG_KEYS.MIDDLEWARE_API_URL),
      username: this.get<string>(CONFIG_KEYS.MIDDLEWARE_USERNAME),
      password: this.get<string>(CONFIG_KEYS.MIDDLEWARE_PASSWORD),
      fromEmail: this.get<string>(CONFIG_KEYS.MIDDLEWARE_FROM_EMAIL),
      fromName: this.get<string>(CONFIG_KEYS.MIDDLEWARE_FROM_NAME),
    };
  }

  // Redis Configuration
  public get redisConfig(): {
    host: string;
    port: number;
    password?: string;
    db: number;
    tls?: {
      servername: string;
    };
  } {
    const tlsEnabled = this.get<boolean>(CONFIG_KEYS.REDIS_TLS_ENABLED, false);
    const host = this.get<string>(CONFIG_KEYS.REDIS_HOST, 'localhost');

    return {
      host,
      port: this.get<number>(CONFIG_KEYS.REDIS_PORT, 6379),
      password: this.get<string>(CONFIG_KEYS.REDIS_PASSWORD) ?? undefined,
      db: this.get<number>(CONFIG_KEYS.REDIS_DB, 0),
      // Add TLS when explicitly enabled via environment variable
      ...(tlsEnabled && {
        tls: {
          servername: host,
        },
      }),
    };
  }

  // Individual Redis getters for direct access
  public get redisHost(): string {
    return this.get<string>(CONFIG_KEYS.REDIS_HOST, 'localhost');
  }

  public get redisPort(): number {
    return this.get<number>(CONFIG_KEYS.REDIS_PORT, 6379);
  }

  public get redisPassword(): string | undefined {
    const password = this.get<string>(CONFIG_KEYS.REDIS_PASSWORD);
    return password ?? undefined;
  }

  public get redisDb(): number {
    return this.get<number>(CONFIG_KEYS.REDIS_DB, 0);
  }

  // Bull Board Dashboard Authentication
  public get bullBoardUsername(): string {
    return this.get<string>(CONFIG_KEYS.BULL_BOARD_USERNAME, 'admin');
  }

  public get bullBoardPassword(): string {
    return this.get<string>(CONFIG_KEYS.BULL_BOARD_PASSWORD, '12345');
  }

  // Database Seeding Authentication
  public get dbSeedingUsername(): string {
    return this.get<string>(CONFIG_KEYS.DB_SEEDING_USERNAME, 'seeder');
  }

  public get dbSeedingPassword(): string {
    return this.get<string>(CONFIG_KEYS.DB_SEEDING_PASSWORD, 'seeder123');
  }

  // UAE Pass Configuration
  public get uaePassConfig(): {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    mobileRedirectUri: string | undefined;
    baseUrl: string | undefined;
    scope: string;
    acrValues: string;
  } {
    const clientId = this.get<string>(CONFIG_KEYS.UAE_PASS_CLIENT_ID);
    const clientSecret = this.get<string>(CONFIG_KEYS.UAE_PASS_CLIENT_SECRET);
    const redirectUri = this.get<string>(CONFIG_KEYS.UAE_PASS_REDIRECT_URI);

    if (clientId == null) {
      throw new Error('UAE_PASS_CLIENT_ID is not configured');
    }
    if (clientSecret == null) {
      throw new Error('UAE_PASS_CLIENT_SECRET is not configured');
    }
    if (redirectUri == null) {
      throw new Error('UAE_PASS_REDIRECT_URI is not configured');
    }

    return {
      clientId,
      clientSecret,
      redirectUri,
      mobileRedirectUri: this.get<string>(
        CONFIG_KEYS.UAE_PASS_MOBILE_REDIRECT_URI
      ),
      baseUrl: this.get<string>(CONFIG_KEYS.UAE_PASS_BASE_URL),
      scope: this.get<string>(
        CONFIG_KEYS.UAE_PASS_SCOPE,
        'urn:uae:digitalid:profile:general'
      ),
      acrValues: this.get<string>(
        CONFIG_KEYS.UAE_PASS_ACR_VALUES,
        'urn:safelayer:tws:policies:authentication:level:low'
      ),
    };
  }
}
