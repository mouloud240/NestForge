import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  compareHash,
  generateHash,
} from '../../../common/utils/authentication/hash.utils.js';
import { AuthResponseDto } from './dtos/responses/auth-response.dto.js';
import { MessageResponseDto } from './dtos/responses/message-response.dto.js';
import { registerDto } from './dtos/requests/register.dto.js';
import type { ConfigType } from '@nestjs/config';
import { RedisService } from 'nestjs-redis-client';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_NAME } from '../../../common/constants/queues.js';
import { Queue } from 'bullmq';
import { MAIL_JOBS } from '../../../common/constants/jobs.js';
import { v4 as uuidv4 } from 'uuid';
import authConfig from '../../../config/auth.config.js';
import { OAuthProfile } from '../oauth/oauth-providers.js';
import { UserService } from '../../user/v1/user.service.js';
import { User } from '../../user/entities/user.entity.js';
import { SessionRequest } from '../types/session-request.type.js';

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly userService: UserService,
    @Inject(authConfig.KEY) authenicationConfig: ConfigType<typeof authConfig>,
    private readonly redisService: RedisService,
    @InjectQueue(QUEUE_NAME.MAIL) private readonly mailQueue: Queue,
  ) {}
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isMailVerified) {
      throw new UnauthorizedException('Email not verified');
    }
    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  async login(request: SessionRequest, user: User): Promise<AuthResponseDto> {
    // Regenerate the session id on login to prevent session fixation.
    await new Promise<void>((resolve, reject) => {
      request.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    request.session.userId = user.id;
    return new AuthResponseDto(user);
  }

  async logout(request: SessionRequest): Promise<MessageResponseDto> {
    return new Promise((resolve, reject) => {
      request.session.destroy((err) => {
        if (err) {
          return reject(err);
        }
        resolve(new MessageResponseDto('Logged out successfully'));
      });
    });
  }

  async registerUser(data: registerDto) {
    const password = await generateHash(data.password);
    const user = await this.userService.createUser({ ...data, password });
    await this.sendVerificationCode(user);
    return new MessageResponseDto(
      'User registered successfully. Please check your email for verification code.',
    );
  }
  async logOauthUser(profile: OAuthProfile): Promise<User> {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      throw new BadRequestException(
        `OAuth ${profile.provider} account has no verified email`,
      );
    }
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      return existing;
    }
    return this.userService.createOAuthUser({
      email,
      provider: profile.provider,
      oauthId: profile.id,
    });
  }
  private async generateAndSetOtp(user: User): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.set(`verification:${user.email}`, otp, 600);
    return otp;
  }

  async sendVerificationCode(user: User) {
    const otp = await this.generateAndSetOtp(user);
    await this.mailQueue.add(MAIL_JOBS.SEND_VERIFICATION_MAIL, {
      to: user.email,
      code: otp,
    });
  }

  async resendVerificationCode(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.sendVerificationCode(user);
    return new MessageResponseDto(
      'Verification code sent successfully. Please check your email.',
    );
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const storedCode = await this.redisService.get(`verification:${email}`);
    if (storedCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }
    user.isMailVerified = true;
    await this.userService.updateUser(user);
    await this.redisService.del(`verification:${email}`);
    return new MessageResponseDto('Email verified successfully.');
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = uuidv4();
    await this.redisService.set(`password-reset:${token}`, user.email, 600);
    await this.mailQueue.add(MAIL_JOBS.SEND_PASSWORD_RESET_MAIL, {
      to: user.email,
      token,
    });
    return new MessageResponseDto(
      'Password reset email sent successfully. Please check your email.',
    );
  }

  async resetPassword(token: string, password: string) {
    const email = await this.redisService.get<string>(
      `password-reset:${token}`,
    );
    if (!email) {
      throw new BadRequestException('Invalid reset token');
    }
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = await generateHash(password);
    await this.userService.updateUser(user);
    await this.redisService.del(`password-reset:${token}`);
    return new MessageResponseDto('Password reset successfully.');
  }
}
