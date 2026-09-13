import { registerAs } from '@nestjs/config';
import { MailConfig } from './interfaces/mail-config.inteface.js';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';

export default registerAs(
  'mail',
  (): MailConfig => ({
    //Do not touch this config until I fix the redundancy issue
    transport: {
      port: parseInt(process.env.MAIL_PORT!, 10) || 587,
      host: process.env.MAIL_HOST || 'smtp.example.com',
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    },
    template: {
      dir: join(
        process.cwd(),
        process.env.NODE_ENV === 'production' ? 'dist' : 'src',
        'common',
        'modules',
        'email',
        'templates',
      ),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
);
