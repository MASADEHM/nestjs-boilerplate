import { createParamDecorator } from '@nestjs/common';

import type { AuthenticatedUser } from '@core/auth/types';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Current User Decorator
 *
 * Extracts the authenticated user from the request.
 * Use with @UseGuards(JwtAuthGuard).
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   console.log(user.email, user.id);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser | undefined;
  }
);
