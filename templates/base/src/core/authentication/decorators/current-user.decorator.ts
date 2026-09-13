import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionRequest } from '../types/session-request.type.js';

export const CurrentUser = createParamDecorator(
  (data: keyof SessionRequest['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<SessionRequest>();
    const { user } = request;
    if (!user) {
      throw new Error('User not found in request');
    }
    if (data) {
      return user[data];
    }
    return user;
  },
);
