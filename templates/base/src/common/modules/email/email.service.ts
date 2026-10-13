import { Injectable, Logger } from '@nestjs/common';
import { Mailer } from '@nestjs/mail';
import { GenericMail } from './generic.mail.js';
import { PasswordResetMail } from './password-reset.mail.js';
import { VerificationMail } from './verification.mail.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly mailer: Mailer) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.mailer.send(GenericMail, { to, data: { subject, body } });
    this.logger.log(`Email sent to ${to}`);
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await this.mailer.send(VerificationMail, { to, data: { code } });
    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    await this.mailer.send(PasswordResetMail, { to, data: { token } });
    this.logger.log(`Password reset email sent to ${to}`);
  }
}
