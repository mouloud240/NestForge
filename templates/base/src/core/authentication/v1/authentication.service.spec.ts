import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service.js';
import { UserService } from '../../user/v1/user.service.js';
import { RedisService } from 'nestjs-redis-client';
import { QUEUE_NAME } from '../../../common/constants/queues.js';
import { MAIL_JOBS } from '../../../common/constants/jobs.js';
import authConfig from '../../../config/auth.config.js';
import { User } from '../../user/entities/user.entity.js';
import { OAuthProfile } from '../oauth/oauth-providers.js';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const createUser = vi.fn();
  const findByEmail = vi.fn();
  const createOAuthUser = vi.fn();
  const mailAdd = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserService,
          useValue: { createUser, findByEmail, createOAuthUser },
        },
        {
          provide: authConfig.KEY,
          useValue: {
            session: {
              secret: 'test-secret',
              name: 'sid',
              cookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 86400000,
              },
            },
            csrf: {
              secret: 'test-csrf-secret',
              cookieName: 'psifi.x-csrf-token',
              secure: false,
            },
            oauth: { google: {} },
          },
        },
        {
          provide: RedisService,
          useValue: { get: vi.fn(), set: vi.fn(), del: vi.fn() },
        },
        {
          provide: getQueueToken(QUEUE_NAME.MAIL),
          useValue: { add: mailAdd },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('stores an argon2id hash instead of the plaintext password', async () => {
      const user = new User();
      user.id = 'user-1';
      user.email = 'user@example.com';
      createUser.mockResolvedValue(user);

      await service.registerUser({
        username: 'user',
        email: 'user@example.com',
        password: 'plain-secret',
        confirmPassword: 'plain-secret',
      });

      expect(createUser).toHaveBeenCalledTimes(1);
      const stored = createUser.mock.calls[0][0];
      expect(stored.password).not.toBe('plain-secret');
      expect(stored.password).toMatch(/^\$argon2id\$/);
      expect(mailAdd).toHaveBeenCalledWith(MAIL_JOBS.SEND_VERIFICATION_MAIL, {
        to: 'user@example.com',
        code: expect.any(String),
      });
    });
  });

  describe('logOauthUser', () => {
    const profile: OAuthProfile = {
      id: 'google-123',
      provider: 'google',
      emails: [{ value: 'USER@example.com', verified: true }],
    };

    it('returns the existing user when the email is already registered', async () => {
      const existing = new User();
      existing.id = 'user-1';
      existing.email = 'user@example.com';
      findByEmail.mockResolvedValue(existing);

      const result = await service.logOauthUser(profile);

      expect(result).toBe(existing);
      expect(createOAuthUser).not.toHaveBeenCalled();
    });

    it('creates a verified user for a new OAuth account', async () => {
      findByEmail.mockResolvedValue(null);
      const created = new User();
      created.id = 'user-2';
      created.email = 'user@example.com';
      createOAuthUser.mockResolvedValue(created);

      const result = await service.logOauthUser(profile);

      expect(createOAuthUser).toHaveBeenCalledWith({
        email: 'user@example.com',
        provider: 'google',
        oauthId: 'google-123',
      });
      expect(result).toBe(created);
    });

    it('rejects a profile without an email', async () => {
      await expect(
        service.logOauthUser({ id: 'x', provider: 'google' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
