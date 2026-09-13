import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/doubles.vitest';
import { UserService } from './user.service.js';
import {
  USER_REPOSITORY,
  type UserRepositoryInterface,
} from '../repository/user.respository-interface.js';
import { User } from '../entities/user.entity.js';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Mocked<UserRepositoryInterface>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    service = unit;
    userRepository = unitRef.get<UserRepositoryInterface>(USER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hash',
      isMailVerified: true,
    };
    userRepository.createUser.mockResolvedValue(user);

    const result = await service.createUser({
      username: 'test',
      email: 'test@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    expect(result).toEqual(user);
  });

  it('should create an OAuth user', async () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: '',
      isMailVerified: true,
      oauthProvider: 'google',
      oauthId: 'google-123',
    };
    userRepository.createOAuthUser.mockResolvedValue(user);

    const result = await service.createOAuthUser({
      email: 'test@example.com',
      provider: 'google',
      oauthId: 'google-123',
    });

    expect(result).toEqual(user);
    expect(userRepository.createOAuthUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      provider: 'google',
      oauthId: 'google-123',
    });
  });

  it('should find a user by email', async () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hash',
      isMailVerified: true,
    };
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await service.findByEmail('test@example.com');

    expect(result).toEqual(user);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should find a user by id', async () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hash',
      isMailVerified: true,
    };
    userRepository.findById.mockResolvedValue(user);

    const result = await service.findById('1');

    expect(result).toEqual(user);
    expect(userRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should update a user', async () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      password: 'hash',
      isMailVerified: true,
    };
    userRepository.updateUser.mockResolvedValue(user);

    const result = await service.updateUser(user);

    expect(result).toEqual(user);
    expect(userRepository.updateUser).toHaveBeenCalledWith(user);
  });
});
