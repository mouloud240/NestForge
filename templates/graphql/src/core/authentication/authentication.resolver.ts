import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthenticationService } from './v1/authentication.service.js';
import { AuthResponseType } from './graphql/types/auth-response.type.js';
import { MessageResponseType } from './graphql/types/message-response.type.js';
import { RegisterInput } from './graphql/inputs/register.input.js';
import { VerifyEmailInput } from './graphql/inputs/verify-email.input.js';
import { ResetPasswordInput } from './graphql/inputs/reset-password.input.js';
import { LocalGuard } from './guards/local.guard.js';
import { SessionAuthGuard } from './guards/session.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { User } from '../user/entities/user.entity.js';
import { SessionRequest } from './types/session-request.type.js';

/**
 * GraphQL resolver for authentication operations
 *
 * Provides mutations for:
 * - User login
 * - User registration
 * - Logout
 * - Email verification
 * - Password reset flow
 *
 * OAuth operations remain in the REST controller
 */
@Resolver()
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalGuard)
  @Mutation(() => AuthResponseType, {
    description: 'Login user and create a server-side session',
  })
  async login(
    @Context() ctx: { req: SessionRequest },
    @CurrentUser() user: User,
  ): Promise<AuthResponseType> {
    return this.authenticationService.login(ctx.req, user);
  }

  @Mutation(() => MessageResponseType, {
    description: 'Register a new user and send verification email',
  })
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<MessageResponseType> {
    return this.authenticationService.registerUser(registerInput);
  }

  @UseGuards(SessionAuthGuard)
  @Mutation(() => MessageResponseType, {
    description: 'Logout user and destroy server-side session',
  })
  async logout(
    @Context() ctx: { req: SessionRequest },
  ): Promise<MessageResponseType> {
    return this.authenticationService.logout(ctx.req);
  }

  @Mutation(() => MessageResponseType, {
    description: 'Resend verification email to user',
  })
  async resendVerification(
    @Args('email') email: string,
  ): Promise<MessageResponseType> {
    return this.authenticationService.resendVerificationCode(email);
  }

  @Mutation(() => MessageResponseType, {
    description: 'Verify user email with the provided code',
  })
  async verifyEmail(
    @Args('verifyEmailInput') verifyEmailInput: VerifyEmailInput,
  ): Promise<MessageResponseType> {
    return this.authenticationService.verifyEmail(
      verifyEmailInput.email,
      verifyEmailInput.code,
    );
  }

  @Mutation(() => MessageResponseType, {
    description: 'Send password reset email to user',
  })
  async forgotPassword(
    @Args('email') email: string,
  ): Promise<MessageResponseType> {
    return this.authenticationService.forgotPassword(email);
  }

  @Mutation(() => MessageResponseType, {
    description: 'Reset user password with the provided token',
  })
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  ): Promise<MessageResponseType> {
    return this.authenticationService.resetPassword(
      resetPasswordInput.token,
      resetPasswordInput.password,
    );
  }
}
