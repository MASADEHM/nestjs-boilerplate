import { CurrentUser } from '@core/auth/decorators';
import { LoginDto } from '@core/auth/dto';
import { JwtAuthGuard } from '@core/auth/guards';
import { AuthService } from '@core/auth/services/auth.service';
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';
import { ResponseHelper } from '@core/shared/helpers';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';

import type { AuthenticatedUser } from '@core/auth/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login with email and password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Res() response: Response
  ): Promise<void> {
    const result = await this.authService.login(loginDto, i18n);
    const message = i18n.t('auth.loginSuccess');
    ResponseHelper.success(result, response, message);
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Res() response: Response
  ): void {
    const message = i18n.t('auth.profileRetrieved');
    ResponseHelper.success(user, response, message);
  }
}
