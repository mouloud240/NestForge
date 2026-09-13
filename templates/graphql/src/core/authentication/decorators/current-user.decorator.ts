import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SessionRequest } from '../types/session-request.type.js';

export const CurrentUser = createParamDecorator(
  (data: keyof SessionRequest['user'] | undefined, ctx: ExecutionContext) => {
    let request: SessionRequest;

    if (ctx.getType<string>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      request = gqlCtx.getContext().req;
    } else {
      request = ctx.switchToHttp().getRequest<SessionRequest>();
    }

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
