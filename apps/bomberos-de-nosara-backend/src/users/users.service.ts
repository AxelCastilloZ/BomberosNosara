// apps/bomberos-de-nosara-backend/src/users/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { Role } from '../roles/entities/role.entity';
import { RoleEnum } from '../roles/role.enum'; // 👈 ajustá esta ruta
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type RoleLike = Role | RoleEnum | string;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly cfg: ConfigService,
  ) {}

  /* ========== Helpers SUPERUSER ========== */

  private normalizeRoleNames(roles?: RoleLike[]): string[] {
    if (!roles?.length) return [];
    return roles
      .map((r) => {
        if (typeof r === 'string') return r;
        if (typeof r === 'number') return String(r); // por si RoleEnum fuera numérico
        return r?.name as unknown as string; // Role.name es RoleEnum
      })
      .filter(Boolean) as string[];
  }

  private hasSuperRole(roles?: RoleLike[]): boolean {
    const names = this.normalizeRoleNames(roles);
    return names.includes(RoleEnum.SUPERUSER); // ✅ enum vs enum/string normalizado
  }

  /** Cuenta SUPERUSERs, con opción de excluir un userId (p.ej. el editado) */
  private async countSuperusers(excludeUserId?: number): Promise<number> {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoin('u.roles', 'r')
      .where('r.name = :name', { name: RoleEnum.SUPERUSER }); // ✅ enum

    if (excludeUserId) qb.andWhere('u.id != :id', { id: excludeUserId });
    return qb.getCount();
  }

  private async fetchRolesByName(names: (RoleEnum | string)[]): Promise<Role[]> {
    const wanted = names.map((n) => (typeof n === 'string' ? n : n)); // string enums ya son string
    const entities = await this.roleRepo.find({ where: { name: In(wanted as any) } });
    if (entities.length !== wanted.length) {
      const found = new Set(entities.map((r) => r.name));
      const missing = wanted.filter((n) => !found.has(n as any));
      if (missing.length) {
        throw new BadRequestException(`Roles inexistentes: ${missing.join(', ')}`);
      }
    }
    return entities;
  }

  /* ========== CRUD ========== */

  async create({ username, email, password, roles }: CreateUserDto): Promise<User> {
    const roleEntities = await this.fetchRolesByName(roles);
    const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    const user = this.userRepo.create({
      username,
      email,
      password: hashedPassword,
      roles: roleEntities,
    });

    return this.userRepo.save(user);
  }

  async findAll(role?: RoleEnum | string): Promise<User[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (role) qb.where('role.name = :role', { role });
    return qb.getMany();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username }, relations: ['roles'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email }, relations: ['roles'] });
  }

  async update(
    id: number,
    { username, email, password, roles }: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si cambian roles, protegemos al último SUPERUSER
    let nextRoles: Role[] | undefined = undefined;
    if (roles && roles.length > 0) {
      nextRoles = await this.fetchRolesByName(roles);

      const wasSuper = this.hasSuperRole(user.roles);
      const willBeSuper = this.hasSuperRole(nextRoles);

      if (wasSuper && !willBeSuper) {
        const others = await this.countSuperusers(user.id);
        if (others === 0) {
          throw new BadRequestException(
            'No se puede quitar el rol SUPERUSER del último superusuario',
          );
        }
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
      user.password = await bcrypt.hash(password, rounds);
    }
    if (nextRoles) user.roles = nextRoles;

    return this.userRepo.save(user);
  }

  async updatePassword(userId: number, newPlain: string): Promise<void> {
    const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
    const hash = await bcrypt.hash(newPlain, rounds);
    await this.userRepo.update({ id: userId }, { password: hash });
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (this.hasSuperRole(user.roles)) {
      const others = await this.countSuperusers(user.id);
      if (others === 0) {
        throw new BadRequestException('No se puede eliminar al último SUPERUSER');
      }
    }

    // === Elegí una de estas dos líneas ===
    // await this.userRepo.softDelete(id); // 👈 Soft delete (recuperable)
    await this.userRepo.delete(id);       // 👈 Hard delete (definitivo)
  }
}
