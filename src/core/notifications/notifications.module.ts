import { Module } from '@nestjs/common';

import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [EmailModule, SmsModule],
  exports: [EmailModule, SmsModule],
})
export class NotificationsModule {}
