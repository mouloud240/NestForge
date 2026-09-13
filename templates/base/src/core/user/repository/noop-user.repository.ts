import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { registerDto } from '../../authentication/v1/dtos/requests/register.dto.js';
import { User } from '../entities/user.entity.js';
import {
  OAuthUserData,
  UserRepositoryInterface,
} from './user.respository-interface.js';

@Injectable()
export class NoopUserRepository implements UserRepositoryInterface {
  private readonly users: User[] = [];

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) ?? null);
  }

  createUser(data: registerDto): Promise<User> {
    const user = new User();
    user.id = uuidv4();
    user.email = data.email;
    user.username = data.username;
    user.password = data.password;
    user.isMailVerified = false;
    this.users.push(user);
    return Promise.resolve(user);
  }

  createOAuthUser(data: OAuthUserData): Promise<User> {
    const user = new User();
    user.id = uuidv4();
    user.email = data.email;
    user.password = '';
    user.isMailVerified = true;
    user.oauthProvider = data.provider;
    user.oauthId = data.oauthId;
    this.users.push(user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) ?? null);
  }

  updateUser(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      return Promise.resolve(user);
    }
    this.users[index] = user;
    return Promise.resolve(user);
  }

  deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    return Promise.resolve();
  }
}
