import type { EmailPayload, TemplateMap } from '../constants/email.constants';

export interface IEmailProvider {
  sendEmail: <K extends keyof TemplateMap>(
    payload: EmailPayload<K>
  ) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}
