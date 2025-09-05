
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly cfg: ConfigService,
  ) {}


  async create({ username, email, password, roles }: CreateUserDto): Promise<User> {
    const roleEntities = await this.roleRepo.find({
      where: { name: In(roles) },
    });
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      username,
      email,
      password: hashedPassword,
      roles: roleEntities,
    });

    return this.userRepo.save(user);
  }

  
  async findAll(role?: string): Promise<User[]> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (role) {
      query.where('role.name = :role', { role });
    }

    return await query.getMany();
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
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) throw new Error('Usuario no encontrado');

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (roles && roles.length > 0) {
      user.roles = await this.roleRepo.find({
        where: { name: In(roles) },
      });
    }

    return this.userRepo.save(user);
  }


  async updatePassword(userId: number, newPlain: string) {
    const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
    const hash = await bcrypt.hash(newPlain, rounds);
    await this.userRepo.update({ id: userId }, { password: hash });
  }


  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }
}
