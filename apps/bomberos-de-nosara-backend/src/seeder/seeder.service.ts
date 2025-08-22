
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RoleEnum } from '../roles/role.enum';
import { PasswordResetService } from '../auth/password-reset.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly cfg: ConfigService,
    private readonly resetSvc: PasswordResetService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedSuperUser();
  }

  private async seedRoles() {
    const baseRoles = Object.values(RoleEnum);
    for (const name of baseRoles) {
      const exists = await this.roleRepo.findOneBy({ name });
      if (!exists) await this.roleRepo.save(this.roleRepo.create({ name }));
    }
  }

  private async seedSuperUser() {
    const username = this.cfg.get<string>('ADMIN_USERNAME', 'superadmin');
    const email = this.cfg.get<string>('ADMIN_EMAIL', 'superadmin@nosara.local');
    const saltRounds = this.cfg.get<number>('BCRYPT_ROUNDS', 10);

    // ¿Ya existe?
    let user = await this.userRepo.findOne({ where: [{ username }, { email }], relations: ['roles'] });
    const superRole = await this.roleRepo.findOneBy({ name: RoleEnum.SUPERUSER });
    if (!superRole) throw new Error('SUPERUSER role not found. Please check role seeding.');

    if (user) {
      const hasSuper = (user.roles ?? []).some(r => r.name === RoleEnum.SUPERUSER);
      if (!hasSuper) {
        user.roles = [...(user.roles ?? []), superRole];
        await this.userRepo.save(user);
        this.logger.log(`Rol SUPERUSER agregado a ${user.username}`);
      }
      return;
    }

    
    const adminPlainPassword = (this.cfg.get<string>('ADMIN_PASSWORD') || '').trim();
    const needsResetEmail = !adminPlainPassword; 

    const plain = adminPlainPassword || crypto.randomBytes(32).toString('hex'); // nunca imprimir
    const password = await bcrypt.hash(plain, saltRounds);

    user = this.userRepo.create({ username, email, password, roles: [superRole] });
    await this.userRepo.save(user);


    const forceReset = this.cfg.get<boolean>('ADMIN_FORCE_PASSWORD_RESET', true);
    if (needsResetEmail || forceReset) {
      const appBaseUrl = this.cfg.get<string>('APP_BASE_URL', 'http://localhost:5173');
      await this.resetSvc.sendResetEmail(email, appBaseUrl, { ip: '127.0.0.1', ua: 'Seeder' });
    }

    this.logger.log(`Superusuario creado: ${username} (${email}).`);
  }
}
