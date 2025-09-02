import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwt: JwtService, private cfg: ConfigService) {}

  canActivate(ctx: ExecutionContext) {
    const client: any = ctx.switchToWs().getClient();

  
    let raw: string | undefined =
      client?.handshake?.auth?.token ??
      client?.handshake?.headers?.authorization;

    if (!raw) throw new WsException('Missing auth token');

    
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

    try {
      const payload = this.jwt.verify(token, {
        secret: this.cfg.get<string>('JWT_SECRET'),
      });
     
      client.user = payload;
      return true;
    } catch (e: any) {
     
      throw new WsException(e?.message || 'Invalid token');
    }
  }
}
