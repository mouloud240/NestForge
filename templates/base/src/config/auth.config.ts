import { registerAs } from '@nestjs/config';
import { AuthConfig } from './interfaces/auth-config.interface.js';

export default registerAs(
  'auth',
  (): AuthConfig => ({
    session: {
      secret: process.env.SESSION_SECRET || 'defaultSessionSecret',
      name: 'sid',
      cookie: {
        httpOnly: true,
        secure: process.env.SESSION_COOKIE_SECURE === 'true',
        sameSite: (process.env.SESSION_COOKIE_SAMESITE as any) || 'lax',
        maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000', 10),
      },
    },
    csrf: {
      secret: process.env.CSRF_SECRET || 'defaultCsrfSecret',
      cookieName: 'psifi.x-csrf-token',
      secure: process.env.CSRF_COOKIE_SECURE === 'true',
    },
    oauth: {
      google: {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
        scope: ['email', 'profile'],
      },
    },
  }),
);
