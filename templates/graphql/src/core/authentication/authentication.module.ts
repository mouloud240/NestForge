import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy.js';
import { LocalGuard } from './guards/local.guard.js';
import { UserModule } from '../user/user.module.js';
import { AuthenticationController } from './v1/authentication.controller.js';
import { AuthenticationService } from './v1/authentication.service.js';
import { SessionAuthGuard } from './guards/session.guard.js';
import { AuthenticationResolver } from './authentication.resolver.js';
import { OAuthStrategyRegistry } from './oauth/oauth-strategy.registry.js';

@Module({
  // .register provides AuthModuleOptions (required by passport v12 guard DI)
  imports: [PassportModule.register({}), UserModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    LocalGuard,
    SessionAuthGuard,
    OAuthStrategyRegistry,
    AuthenticationResolver,
  ],
  exports: [SessionAuthGuard],
})
export class AuthenticationModule {}
