import { Inject, Injectable } from '@nestjs/common';
import { registerDto } from '../../authentication/v1/dtos/requests/register.dto.js';
import { User } from '../entities/user.entity.js';
import { USER_REPOSITORY } from '../repository/user.respository-interface.js';
import type {
  OAuthUserData,
  UserRepositoryInterface,
} from '../repository/user.respository-interface.js';
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  createUser(data: registerDto): Promise<User> {
    return this.userRepository.createUser(data);
  }

  createOAuthUser(data: OAuthUserData): Promise<User> {
    return this.userRepository.createOAuthUser(data);
  }
  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
  findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  updateUser(user: User): Promise<User> {
    return this.userRepository.updateUser(user);
  }

  deleteUser(id: string): Promise<void> {
    return this.userRepository.deleteUser(id);
  }
}
