import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  doubleCsrf,
  DoubleCsrfConfigOptions,
  DoubleCsrfUtilities,
} from 'csrf-csrf';
import { Request, Response } from 'express';
import { SessionRequest } from '../../../core/authentication/types/session-request.type.js';

@Injectable()
export class CsrfService {
  private readonly csrf: DoubleCsrfUtilities;

  constructor(private readonly configService: ConfigService) {
    const authConfig = this.configService.get('auth');

    const opts: DoubleCsrfConfigOptions = {
      getSecret: () => authConfig?.csrf?.secret ?? 'defaultCsrfSecret',
      getSessionIdentifier: (req: Request) => (req as SessionRequest).sessionID,
      cookieName: authConfig?.csrf?.cookieName ?? 'psifi.x-csrf-token',
      cookieOptions: {
        sameSite: 'lax',
        path: '/',
        secure: authConfig?.csrf?.secure ?? false,
        httpOnly: false,
      },
      size: 64,
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    };

    this.csrf = doubleCsrf(opts);
  }

  middleware() {
    return this.csrf.doubleCsrfProtection;
  }

  generateToken(req: Request, res: Response): string {
    return this.csrf.generateCsrfToken(req, res);
  }
}
