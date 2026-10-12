import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class DbSeederBasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Basic ') !== true) {
      return false;
    }

    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf8'
    );
    const [username, password] = credentials.split(':');

    const expectedUsername = this.configService.get<string>(
      'DB_SEEDING_USERNAME'
    );
    const expectedPassword = this.configService.get<string>(
      'DB_SEEDING_PASSWORD'
    );

    return username === expectedUsername && password === expectedPassword;
  }
}
