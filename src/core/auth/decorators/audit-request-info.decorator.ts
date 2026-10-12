import { createParamDecorator } from '@nestjs/common';

import type { AuditInfo, AuthenticatedUser } from '@core/auth/types/auth.types';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const AuditRequestInfo = createParamDecorator(
  (_data: undefined, ctx: ExecutionContext): AuditInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    const ip = getClientIp(request);
    const userAgentHeader = request.headers['user-agent'];
    const userAgent =
      typeof userAgentHeader === 'string' && userAgentHeader !== ''
        ? userAgentHeader
        : 'Unknown';

    const isAuthenticated = user !== undefined;

    // Create audit string based on authentication status
    let auditString: string;

    if (isAuthenticated) {
      auditString = user.email;
    } else {
      // Anonymous request - include IP and user agent for tracing
      const truncatedAgent =
        userAgent.length > 100 ? userAgent.slice(0, 100) : userAgent;
      auditString = `anonymous - ip:${ip} - agent:${truncatedAgent}`;
    }

    return {
      user,
      isAuthenticated,
      ip,
      userAgent,
      auditString,
    };
  }
);

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers['x-forwarded-for'];
  const xRealIp = request.headers['x-real-ip'];

  if (typeof forwardedFor === 'string' && forwardedFor !== '') {
    return forwardedFor.split(',')[0].trim();
  }

  if (typeof xRealIp === 'string' && xRealIp !== '') {
    return xRealIp;
  }

  return request.ip ?? request.socket.remoteAddress ?? 'unknown';
};
