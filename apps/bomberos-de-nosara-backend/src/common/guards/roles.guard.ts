// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../../roles/role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // si no exige roles → permitir
    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;

    // Normaliza: siempre termina en RoleEnum[]
    const userRoles: RoleEnum[] = Array.isArray(user?.roles)
      ? (user!.roles as RoleEnum[])
      : [];

    if (userRoles.length === 0) return false;

    return requiredRoles.some((r) => userRoles.includes(r));
  }
}
