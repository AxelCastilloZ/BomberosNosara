// src/seeder/seeder.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import {  RoleEnum } from 'src/roles/role.enum'; // ✅ importar RoleEnum
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';


@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedSuperUser();
  }

  private async seedRoles() {
    const baseRoles = Object.values(RoleEnum); // ✅ Usar el enum directamente

    for (const name of baseRoles) {
      const exists = await this.roleRepo.findOneBy({ name });
      if (!exists) {
        const role = this.roleRepo.create({ name });
        await this.roleRepo.save(role);
      }
    }
  }

  private async seedSuperUser() {
    const exists = await this.userRepo.findOneBy({ username: 'superadmin' });
    if (exists) return;

    const superRole = await this.roleRepo.findOneBy({ name: RoleEnum.SUPERUSER }); 
    if (!superRole) {
      throw new Error('SUPERUSER role not found. Please check role seeding.');
    }

    const password = await bcrypt.hash('supersecure123', 10);

    const user = this.userRepo.create({
      username: 'superadmin',
      password,
      roles: [superRole],
    });

    await this.userRepo.save(user);
    console.log(' Superusuario creado: superadmin / supersecure123');
  }
}
