import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/doubles.vitest';
import { Mailer } from '@nestjs/mail';
import { EmailService } from './email.service.js';
import { GenericMail } from './generic.mail.js';
import { PasswordResetMail } from './password-reset.mail.js';
import { VerificationMail } from './verification.mail.js';

describe('EmailService', () => {
  let service: EmailService;
  let mailer: Mocked<Mailer>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(EmailService).compile();
    service = unit;
    mailer = unitRef.get(Mailer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a plain email', async () => {
    mailer.send.mockResolvedValue(undefined as never);

    await service.sendEmail('to@example.com', 'subject', 'body');

    expect(mailer.send).toHaveBeenCalledWith(GenericMail, {
      to: 'to@example.com',
      data: { subject: 'subject', body: 'body' },
    });
  });

  it('should send a verification email', async () => {
    mailer.send.mockResolvedValue(undefined as never);

    await service.sendVerificationEmail('to@example.com', '123456');

    expect(mailer.send).toHaveBeenCalledWith(VerificationMail, {
      to: 'to@example.com',
      data: { code: '123456' },
    });
  });

  it('should send a password reset email', async () => {
    mailer.send.mockResolvedValue(undefined as never);

    await service.sendPasswordResetEmail('to@example.com', 'token');

    expect(mailer.send).toHaveBeenCalledWith(PasswordResetMail, {
      to: 'to@example.com',
      data: { token: 'token' },
    });
  });
});
