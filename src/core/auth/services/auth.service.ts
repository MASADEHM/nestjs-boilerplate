import { AUTH_DEFAULTS } from '@core/auth/constants';
import {
  AuthenticatedUserResponse,
  LoginDto,
  LoginResponse,
} from '@core/auth/dto';
import { ConfigService } from '@core/config/config.service';
import { PrismaService } from '@core/database/services/prisma.service';
import { ApiException } from '@core/shared/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { AuthenticatedUser, JwtPayload } from '@core/auth/types';
import type { I18nTranslations } from '@core/i18n/generated/i18n.generated';
import type { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Authenticate user with email and password
   */
  public async login(
    loginDto: LoginDto,
    i18n: I18nContext<I18nTranslations>
  ): Promise<LoginResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (user === null) {
      const message = i18n.t('auth.invalidCredentials');
      throw ApiException.unauthorized(message);
    }

    if (user.password === null) {
      const message = i18n.t('auth.passwordNotSet');
      throw ApiException.unauthorized(message);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      const message = i18n.t('auth.invalidCredentials');
      throw ApiException.unauthorized(message);
    }

    if (user.status !== 'ACTIVE') {
      const message = i18n.t('auth.accountNotActive');
      throw ApiException.unauthorized(message);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      accessToken: token,
      user: AuthenticatedUserResponse.from({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        full_name_ar: user.full_name_ar,
        status: user.status,
      }),
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  public async validateUser(userId: number): Promise<AuthenticatedUser> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (user === null) {
      throw ApiException.unauthorized('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw ApiException.unauthorized('Account is not active');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      full_name_ar: user.full_name_ar,
      status: user.status,
    };
  }

  /**
   * Hash a password
   */
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AUTH_DEFAULTS.PASSWORD_HASH_ROUNDS);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number, email: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtExpiresIn,
    });
  }
}
