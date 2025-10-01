// src/common/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new Error('Usuario no encontrado en el request. ¿Falta @UseGuards(JwtAuthGuard)?');
    }
    
    return data ? user[data] : user;
  },
);