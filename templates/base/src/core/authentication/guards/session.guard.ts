import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionRequest } from '../types/session-request.type.js';
import { UserService } from '../../user/v1/user.service.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const userId = request.session?.userId;
    if (!userId) {
      throw new UnauthorizedException('Session not found');
    }
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    request.user = user;
    return true;
  }
}
