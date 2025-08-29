import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { RoleEnum } from '../../roles/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(p: JwtPayload) {
    // Normaliza roles a RoleEnum[] por si vinieran valores raros
    const validRoles: RoleEnum[] = (p.roles ?? []).filter((r): r is RoleEnum =>
      (Object.values(RoleEnum) as string[]).includes(r as unknown as string),
    );

    // Lo que quedará en req.user
    return {
      userId: p.sub,
      email: p.email,
      roles: validRoles,
    };
  }
}
