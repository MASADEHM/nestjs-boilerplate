import { JWT_STRATEGY_NAME } from '@core/auth/constants';
import { AuthService } from '@core/auth/services/auth.service';
import { ConfigService } from '@core/config/config.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AuthenticatedUser, JwtPayload } from '@core/auth/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtSecret,
      ignoreExpiration: false,
    });
  }

  public async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return this.authService.validateUser(payload.sub);
  }
}
