import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../../user/entities/user.entity.js';
import { AuthenticationService } from '../v1/authentication.service.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authenticationService: AuthenticationService) {
    super({
      usernameField: 'email', //change this to 'username' if you want to use username instead of email
      passwordField: 'password',
    });
  }
  async validate(email: string, password: string): Promise<User> {
    return this.authenticationService.validateUser(email, password);
  }
}
