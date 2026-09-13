import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticationService } from './authentication.service.js';
import { registerDto } from './dtos/requests/register.dto.js';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dtos/responses/auth-response.dto.js';
import { CsrfTokenDto } from './dtos/responses/csrf-token.dto.js';
import { LocalGuard } from '../guards/local.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import type { User } from '../../user/entities/user.entity.js';
import { SessionAuthGuard } from '../guards/session.guard.js';
import { OAuthGuard } from '../guards/oauth/oauth.guard.js';
import type { SessionRequest } from '../types/session-request.type.js';
import { CsrfService } from '../../../common/modules/csrf/csrf.service.js';
import { LoginDto } from './dtos/requests/login.dto.js';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly csrfService: CsrfService,
  ) {}

  @Get('csrf')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get CSRF token',
    description:
      'Generates and returns a CSRF token. The matching cookie is also set.',
  })
  @ApiOkResponse({
    description: 'Returns the CSRF token.',
  })
  csrfToken(
    @Req() request: SessionRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return new CsrfTokenDto(this.csrfService.generateToken(request, response));
  }

  @UseGuards(LocalGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Logs in a user and creates a server-side session.',
  })
  @ApiOkResponse({
    description: 'Returns the authenticated user details.',
    type: () => AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials provided.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. The request body is invalid or missing required fields.',
  })
  @ApiBody({
    description: 'Login credentials',
    type: () => LoginDto,
  })
  async login(@Req() request: SessionRequest, @CurrentUser() user: User) {
    return this.authenticationService.login(request, user);
  }
  @ApiOperation({
    summary: 'Register user',
    description: 'Registers a new user and sends a verification email.',
  })
  @ApiOkResponse({
    description: 'Returns a success message.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. The request body is invalid or missing required fields.',
  })
  @Post('register')
  async register(@Body() data: registerDto) {
    return this.authenticationService.registerUser(data);
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Destroys the current server-side session.',
  })
  @ApiOkResponse({
    description: 'Returns a success message.',
  })
  async logout(@Req() request: SessionRequest) {
    return this.authenticationService.logout(request);
  }

  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Resends the verification email to the user.',
  })
  @ApiOkResponse({
    description: 'Returns a message indicating that the email has been sent.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async resendVerification(@Body('email') email: string) {
    return this.authenticationService.resendVerificationCode(email);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email',
    description: "Verifies the user's email with the provided code.",
  })
  @ApiOkResponse({
    description:
      'Returns a message indicating that the email has been verified.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code.',
  })
  async verifyEmail(@Body('email') email: string, @Body('code') code: string) {
    return this.authenticationService.verifyEmail(email, code);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Sends a password reset email to the user.',
  })
  @ApiOkResponse({
    description: 'Returns a message indicating that the email has been sent.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async forgotPassword(@Body('email') email: string) {
    return this.authenticationService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: "Resets the user's password with the provided token.",
  })
  @ApiOkResponse({
    description:
      'Returns a message indicating that the password has been reset.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reset token.',
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authenticationService.resetPassword(token, password);
  }

  @ApiOperation({
    summary: 'Google OAuth2 login',
    description: 'Initiates the Google OAuth2 login flow.',
  })
  @UseGuards(OAuthGuard('google'))
  @Get('oauth/google')
  googleAuth() {
    return;
  }

  @UseGuards(OAuthGuard('google'))
  @Get('oauth/google/callback')
  async googleAuthRedirect(
    @Req() request: SessionRequest,
    @CurrentUser() user: User,
  ) {
    return this.authenticationService.login(request, user);
  }
}
