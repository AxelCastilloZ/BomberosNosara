import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileUser } from './entities/mobile-user.entity';
import { UsersService } from '../../users/users.service'; // Inyectar
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MobileUsersService {
  constructor(
    @InjectRepository(MobileUser)
    private readonly mobileUserRepo: Repository<MobileUser>,
    private readonly usersService: UsersService, // Inyectar UsersService
    private readonly cfg: ConfigService,
  ) {}

  // ========== MÉTODOS DE CONSULTA ==========

  async findByDeviceId(deviceId: string): Promise<MobileUser | null> {
    return this.mobileUserRepo.findOne({ where: { deviceId } });
  }

  async findById(id: number): Promise<MobileUser | null> {
    return this.mobileUserRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<MobileUser | null> {
    return this.mobileUserRepo.findOne({ where: { email } });
  }

  // ========== CREAR USUARIO ANÓNIMO ==========

  async createAnonymous(
    deviceId: string,
    deviceInfo?: any,
  ): Promise<MobileUser> {
    // Generar username único
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const username = `anon_${randomSuffix}`;

    const mobileUser = this.mobileUserRepo.create({
      deviceId,
      username,
      isAnonymous: true,
      deviceInfo,
    });

    return this.mobileUserRepo.save(mobileUser);
  }

  // ========== REGISTRAR CIUDADANO ==========

  async registerCitizen(
    email: string,
    password: string,
    username?: string,
    deviceId?: string,
    deviceInfo?: any,
  ): Promise<MobileUser> {
    // Verificar que el email NO exista en User (web)
    const webUser = await this.usersService.findByEmail(email);
    if (webUser) {
      throw new ConflictException('Este email ya está registrado en el sistema');
    }

    // Verificar que el email NO exista en MobileUser
    const existingMobile = await this.findByEmail(email);
    if (existingMobile) {
      throw new ConflictException('Este email ya está registrado');
    }

    // Hash de contraseña
    const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    // Generar username si no se provee
    const finalUsername = username || `user_${Math.random().toString(36).substring(2, 8)}`;

    // Crear ciudadano
    const mobileUser = this.mobileUserRepo.create({
      email,
      password: hashedPassword,
      username: finalUsername,
      isAnonymous: false,
      deviceId,
      deviceInfo,
    });

    return this.mobileUserRepo.save(mobileUser);
  }

  // ========== COMPLETAR PERFIL ANÓNIMO ==========






async findByUsername(username: string): Promise<MobileUser | null> {
  return this.mobileUserRepo.findOne({ where: { username } });
}



  async completeProfile(
    mobileUserId: number,
    email: string,
    password: string,
    username?: string,
  ): Promise<MobileUser> {
    const mobileUser = await this.findById(mobileUserId);
    if (!mobileUser) {
      throw new NotFoundException('Usuario móvil no encontrado');
    }

    // Verificar que el email NO exista en User (web)
    const webUser = await this.usersService.findByEmail(email);
    if (webUser) {
      throw new ConflictException('Este email ya está registrado en el sistema');
    }

    // Verificar que el email NO exista en MobileUser (excepto el actual)
    const existingEmail = await this.findByEmail(email);
    if (existingEmail && existingEmail.id !== mobileUserId) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de contraseña
    const rounds = Number(this.cfg.get('BCRYPT_ROUNDS') ?? 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    // Actualizar usuario
    mobileUser.email = email;
    mobileUser.password = hashedPassword;
    mobileUser.isAnonymous = false;

    if (username) {
      mobileUser.username = username;
    }

    return this.mobileUserRepo.save(mobileUser);
  }

  // ========== VALIDAR CONTRASEÑA ==========

  async validatePassword(
    mobileUser: MobileUser,
    password: string,
  ): Promise<boolean> {
    if (!mobileUser.password) return false;
    return bcrypt.compare(password, mobileUser.password);
  }
}