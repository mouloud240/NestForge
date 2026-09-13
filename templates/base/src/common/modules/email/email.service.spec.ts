import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/doubles.vitest';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service.js';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: Mocked<MailerService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(EmailService).compile();
    service = unit;
    mailerService = unitRef.get(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a plain email', async () => {
    mailerService.sendMail.mockResolvedValue(undefined as never);

    await service.sendEmail('to@example.com', 'subject', 'body');

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'to@example.com',
      subject: 'subject',
      text: 'body',
    });
  });

  it('should send a verification email', async () => {
    mailerService.sendMail.mockResolvedValue(undefined as never);

    await service.sendVerificationEmail('to@example.com', '123456');

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'to@example.com',
      subject: 'Email Verification',
      template: './verification',
      context: { code: '123456' },
    });
  });

  it('should send a password reset email', async () => {
    mailerService.sendMail.mockResolvedValue(undefined as never);

    await service.sendPasswordResetEmail('to@example.com', 'token');

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'to@example.com',
      subject: 'Password Reset',
      template: './password-reset',
      context: { token: 'token' },
    });
  });
});
