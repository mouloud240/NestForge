import { Injectable } from '@nestjs/common';
import { html, type Mailable } from '@nestjs/mail';

export interface GenericMailData {
  subject: string;
  body: string;
}

@Injectable()
export class GenericMail implements Mailable<GenericMailData> {
  render({ subject, body }: GenericMailData) {
    return {
      subject,
      html: html`<p>${body}</p>`,
    };
  }
}
