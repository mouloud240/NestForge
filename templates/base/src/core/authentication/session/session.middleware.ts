import { RequestHandler } from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis-client';
import { AuthConfig } from '../../../config/interfaces/auth-config.interface.js';

export function createSessionMiddleware(
  configService: ConfigService,
  redisService: RedisService,
): RequestHandler {
  const authConfig = configService.get<AuthConfig>('auth');
  if (!authConfig) {
    throw new Error('Auth configuration not found');
  }
  return session({
    store: new RedisStore({
      client: (redisService as any).getClient(),
    }),
    secret: authConfig.session.secret,
    name: authConfig.session.name,
    resave: false,
    // A stable session must exist from the first request so the CSRF token
    // binds to a persistent identifier on pre-auth routes.
    saveUninitialized: true,
    cookie: authConfig.session.cookie,
  });
}
