import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@repo/shared-types';

export const CurrentUser = createParamDecorator(
  ( ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

