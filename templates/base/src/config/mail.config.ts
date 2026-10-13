import { registerAs } from '@nestjs/config';
import { MailConfig } from './interfaces/mail-config.inteface.js';

export default registerAs(
  'mail',
  (): MailConfig => ({
    from: process.env.MAIL_FROM || 'NestForge <no-reply@localhost>',
    transport:
      process.env.MAIL_TRANSPORT === 'smtp' ||
      process.env.MAIL_TRANSPORT === 'resend'
        ? process.env.MAIL_TRANSPORT
        : 'file',
    directory: process.env.MAIL_DIRECTORY || 'var/mail',
    smtpUrl: process.env.SMTP_URL,
    resendApiKey: process.env.RESEND_API_KEY,
  }),
);
