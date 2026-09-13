import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import passport from 'passport';
import authConfig from '../../../config/auth.config.js';
import { AuthenticationService } from '../v1/authentication.service.js';
import { OAuthProfile, OAUTH_PROVIDERS } from './oauth-providers.js';

@Injectable()
export class OAuthStrategyRegistry implements OnModuleInit {
  logger = new Logger(OAuthStrategyRegistry.name);
  private readonly enabledProviders = new Set<string>();

  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly authService: AuthenticationService,
  ) {}

  onModuleInit() {
    for (const provider of OAUTH_PROVIDERS) {
      if (!provider.isEnabled(this.authConfiguration)) {
        this.logger.log(
          `OAuth provider '${provider.name}' is disabled (not configured)`,
        );
        continue;
      }
      passport.use(
        provider.name,
        provider.buildStrategy(
          this.authConfiguration,
          this.verify.bind(this),
        ) as never,
      );
      this.enabledProviders.add(provider.name);
      this.logger.log(`OAuth provider '${provider.name}' is enabled`);
    }
  }

  isEnabled(name: string): boolean {
    return this.enabledProviders.has(name);
  }

  private verify(
    _accessToken: string,
    _refreshToken: string,
    profile: OAuthProfile,
    done: (error: Error | null, user?: unknown) => void,
  ) {
    this.authService
      .logOauthUser(profile)
      .then((user) => done(null, user))
      .catch((error) => done(error));
  }
}
