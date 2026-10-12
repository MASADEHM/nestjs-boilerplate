import { JobQueueService } from '@core/jobs/services/job-queue.service';
import { Injectable } from '@nestjs/common';

import { EmailPayload, TemplateMap } from '../constants/email.constants';

@Injectable()
export class EmailQueueService {
  constructor(private readonly jobQueueService: JobQueueService) {}

  /**
   * Queue email for sending
   */
  public async queueEmail<K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ): Promise<void> {
    await this.jobQueueService.addEmailJob(payload);
  }
}
