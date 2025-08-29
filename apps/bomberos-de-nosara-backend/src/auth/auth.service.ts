import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RoleEnum } from '../roles/role.enum'; // <- IMPORTANTE

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Acepta usernameOrEmail (recomendado) o username/email por retrocompatibilidad
    const identifier =
      (dto as any).usernameOrEmail ??
      (dto as any).username ??
      (dto as any).email;

    // Busca por email o username; si tu UsersService aún no tiene findByEmailOrUsername,
    // cae a findByUsername como fallback.
    const user =
      (await this.users.findByEmailOrUsername?.(identifier)) ??
      (await this.users.findByUsername?.(identifier));

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Soporta passwordHash o password (según tu entidad actual)
    const storedHash = (user as any).passwordHash ?? (user as any).password;
    if (!storedHash) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, storedHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    // Normaliza roles del usuario a RoleEnum[]
    const roles: RoleEnum[] = Array.isArray((user as any).roles)
      ? ((user as any).roles as any[])
          .map((r) => (typeof r === 'string' ? r : r?.name))
          .filter((v): v is RoleEnum =>
            (Object.values(RoleEnum) as string[]).includes(String(v)),
          )
      : [];

    const payload = {
      sub: (user as any).id,
      email: (user as any).email ?? '',
      roles,
    };

    const access_token = this.jwt.sign(payload, {
      expiresIn: '24h',
      issuer: 'bomberos-api',
      audience: 'web',
    });

    return {
      access_token,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        username: (user as any).username,
        roles,
      },
    };
  }
}
