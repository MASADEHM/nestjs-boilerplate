import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Authentication Module
 *
 * Provides JWT-based authentication for the application.
 *
 * Features:
 * - JWT authentication with Passport
 * - Login endpoint
 * - Protected route support via JwtAuthGuard
 * - Current user extraction via @CurrentUser() decorator
 * - Public route support via @Public() decorator
 */
@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
