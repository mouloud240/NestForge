import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';

export interface VerificationMailData {
  code: string;
}

@Injectable()
export class VerificationMail implements Mailable<VerificationMailData> {
  render({ code }: VerificationMailData) {
    return {
      subject: 'Email Verification',
      template: 'verification',
      context: { code },
    };
  }
}
