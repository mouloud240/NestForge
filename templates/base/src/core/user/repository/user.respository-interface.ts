import { registerDto } from '../../authentication/v1/dtos/requests/register.dto.js';
import { User } from '../entities/user.entity.js';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface OAuthUserData {
  email: string;
  provider: string;
  oauthId: string;
}

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  createUser(data: registerDto): Promise<User>;
  createOAuthUser(data: OAuthUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  updateUser(user: User): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
