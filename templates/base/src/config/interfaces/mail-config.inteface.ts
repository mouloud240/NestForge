export type MailTransportName = 'file' | 'smtp' | 'resend';

export interface MailConfig {
  from: string;
  transport: MailTransportName;
  directory: string;
  smtpUrl?: string;
  resendApiKey?: string;
}
