import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SmsProviderFactory } from './factories/sms-provider.factory';
import { MiddlewareSmsProvider } from './providers/middleware-sms.provider';
import { SmsService } from './services/sms.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [SmsService, SmsProviderFactory, MiddlewareSmsProvider],
  exports: [SmsService],
})
export class SmsModule {}
