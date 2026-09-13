import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { MailerModule } from '@nestjs-modules/mailer';
import mailConfig from '../../../config/mail.config.js';

@Module({
  imports: [MailerModule.forRootAsync(mailConfig.asProvider())],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
