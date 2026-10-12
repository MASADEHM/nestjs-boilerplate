import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import * as handlebars from 'handlebars';

import { EMAIL_TEMPLATES } from '../constants/email.constants';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templateCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();
  private readonly templatesDir = join(__dirname, '..', 'templates');

  /**
   * Render email template with context data
   */
  public renderTemplate(emailData: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, unknown>;
  }): { subject: string; html: string; text?: string } {
    try {
      const template = this.getCompiledTemplate(emailData.template);

      const html = template(emailData.context);
      const text = this.generateTextFromHtml(html);

      return {
        subject: emailData.subject,
        html,
        text,
      };
    } catch (error) {
      this.logger.error(
        `Failed to render template ${emailData.template}:`,
        error
      );
      throw new Error(`Template rendering failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get compiled Handlebars template with caching
   */
  private getCompiledTemplate(
    templateName: string
  ): HandlebarsTemplateDelegate {
    const cachedTemplate = this.templateCache.get(templateName);
    if (cachedTemplate != null) {
      return cachedTemplate;
    }

    try {
      // Map template name to literal path and read directly to prevent path traversal
      // Only allow whitelisted template names from EMAIL_TEMPLATES
      const templateSource = this.readTemplateFile(templateName);
      const compiledTemplate = handlebars.compile(templateSource);

      this.templateCache.set(templateName, compiledTemplate);
      return compiledTemplate;
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  /**
   * Read template file directly using literal paths to prevent path traversal
   * Uses switch statement so each path segment is a literal string
   */
  private readTemplateFile(templateName: string): string {
    const templatesDir = join(__dirname, '..', 'templates');

    switch (templateName) {
      case EMAIL_TEMPLATES.USER_EMAIL_VERIFICATION:
        return readFileSync(
          join(templatesDir, 'user-email-verification.hbs'),
          'utf8'
        );
      case EMAIL_TEMPLATES.USER_PASSWORD_RESET:
        return readFileSync(
          join(templatesDir, 'user-password-reset.hbs'),
          'utf8'
        );
      case EMAIL_TEMPLATES.ADMIN_INVITATION:
        return readFileSync(join(templatesDir, 'admin-invitation.hbs'), 'utf8');
      case EMAIL_TEMPLATES.ADMIN_WELCOME:
        return readFileSync(join(templatesDir, 'admin-welcome.hbs'), 'utf8');
      case EMAIL_TEMPLATES.ADMIN_PASSWORD_RESET:
        return readFileSync(
          join(templatesDir, 'admin-password-reset.hbs'),
          'utf8'
        );
      case EMAIL_TEMPLATES.USER_INVITATION:
        return readFileSync(join(templatesDir, 'user-invitation.hbs'), 'utf8');
      case EMAIL_TEMPLATES.WELCOME:
        return readFileSync(join(templatesDir, 'welcome.hbs'), 'utf8');
      case EMAIL_TEMPLATES.INVITE:
        return readFileSync(join(templatesDir, 'invite.hbs'), 'utf8');
      default:
        throw new Error(`Invalid template name: ${templateName}`);
    }
  }

  /**
   * Generate plain text from HTML
   */
  private generateTextFromHtml(html: string): string {
    // Use a more efficient regex pattern to avoid ReDoS vulnerability
    // Match HTML tags with a bounded quantifier to prevent catastrophic backtracking
    return html
      .replaceAll(/<[^>]{0,1000}>/g, '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .trim();
  }
}
