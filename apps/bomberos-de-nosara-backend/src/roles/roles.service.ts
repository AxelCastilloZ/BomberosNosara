// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleEnum } from 'src/roles/role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find();
  }

  async findByName(name: RoleEnum): Promise<Role | null> {
    return this.roleRepo.findOneBy({ name });
  }

  async createIfNotExists(name: RoleEnum): Promise<Role> {
    let role = await this.findByName(name);
    if (!role) {
      role = this.roleRepo.create({ name });
      await this.roleRepo.save(role);
    }
    return role;
  }
}
