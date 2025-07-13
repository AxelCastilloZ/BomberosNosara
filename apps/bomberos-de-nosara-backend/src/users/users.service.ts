import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, roles } = createUserDto;

    const roleEntities = await this.roleRepo.find({
      where: { name: In(roles) },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      roles: roleEntities,
    });

    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['roles'] });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
  const { username, password, roles } = updateDto;

  const user = await this.userRepo.findOne({
    where: { id },
    relations: ['roles'],
  });
  if (!user) throw new Error('Usuario no encontrado');

  if (username) user.username = username;
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
  }

  if (roles && roles.length > 0) {
    const roleEntities = await this.roleRepo.find({
      where: { name: In(roles) },
    });
    user.roles = roleEntities;
  }

  return this.userRepo.save(user);
}

async remove(id: number): Promise<void> {
  await this.userRepo.delete(id);
}


}
