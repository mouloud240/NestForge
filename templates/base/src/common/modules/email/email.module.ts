import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  FileMailTransport,
  FileTemplateEngine,
  MailModule,
  ResendTransport,
  SmtpTransport,
  type MailTransport,
} from '@nestjs/mail';
import { join } from 'node:path';
import mailConfig from '../../../config/mail.config.js';
import { EmailService } from './email.service.js';
import { GenericMail } from './generic.mail.js';
import { PasswordResetMail } from './password-reset.mail.js';
import { VerificationMail } from './verification.mail.js';

/**
 * The transport for this environment: `file` in development (the default),
 * `smtp` or `resend` in production. Missing settings fail at startup,
 * naming the variable.
 */
export function mailTransport(
  config: ConfigType<typeof mailConfig>,
): MailTransport {
  switch (config.transport) {
    case 'file':
      return new FileMailTransport({ directory: config.directory });
    case 'smtp':
      if (!config.smtpUrl) {
        throw new Error('SMTP_URL is required when MAIL_TRANSPORT is "smtp"');
      }
      return new SmtpTransport({ url: config.smtpUrl, pool: true });
    case 'resend':
      if (!config.resendApiKey) {
        throw new Error(
          'RESEND_API_KEY is required when MAIL_TRANSPORT is "resend"',
        );
      }
      return new ResendTransport({ apiKey: config.resendApiKey });
    default:
      throw new Error(
        `MAIL_TRANSPORT must be "file", "smtp" or "resend" (got "${config.transport}")`,
      );
  }
}

@Module({
  imports: [
    MailModule.forRootAsync({
      inject: [mailConfig.KEY],
      useFactory: (config: ConfigType<typeof mailConfig>) => ({
        transport: mailTransport(config),
        templates: new FileTemplateEngine({
          dir: join(import.meta.dirname, 'templates'),
          cache: process.env.NODE_ENV === 'production',
        }),
        from: config.from,
      }),
    }),
  ],
  providers: [EmailService, GenericMail, VerificationMail, PasswordResetMail],
  exports: [EmailService],
})
export class EmailModule {}
