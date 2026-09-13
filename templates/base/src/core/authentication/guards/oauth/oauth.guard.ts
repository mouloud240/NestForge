import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthStrategyRegistry } from '../../oauth/oauth-strategy.registry.js';

export function OAuthGuard(provider: string) {
  @Injectable()
  class ProviderOAuthGuard extends AuthGuard(provider) {
    constructor(readonly registry: OAuthStrategyRegistry) {
      super({ session: false });
    }

    canActivate(context: ExecutionContext) {
      if (!this.registry.isEnabled(provider)) {
        throw new NotFoundException(
          `OAuth provider '${provider}' is not configured`,
        );
      }
      return super.canActivate(context);
    }
  }
  return ProviderOAuthGuard;
}
