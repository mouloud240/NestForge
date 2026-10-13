import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';

export interface PasswordResetMailData {
  token: string;
}

@Injectable()
export class PasswordResetMail implements Mailable<PasswordResetMailData> {
  render({ token }: PasswordResetMailData) {
    return {
      subject: 'Password Reset',
      template: 'password-reset',
      context: { token },
    };
  }
}
