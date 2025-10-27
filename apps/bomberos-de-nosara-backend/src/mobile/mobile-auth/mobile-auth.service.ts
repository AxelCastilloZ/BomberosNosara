import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MobileUsersService } from '../mobile-users/mobile-users.service';
import { UsersService } from '../../users/users.service';
import { CreateAnonymousDto } from './dto/create-anonymous.dto';
import { DeviceLoginDto } from './dto/device-login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class MobileAuthService {
  constructor(
    private readonly mobileUsersService: MobileUsersService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ========== CREAR ANÓNIMO ==========

  async createAnonymousUser(dto: CreateAnonymousDto) {
    const existing = await this.mobileUsersService.findByDeviceId(dto.deviceId);
    if (existing) {
      throw new ConflictException('Ya existe un usuario con este dispositivo');
    }

    const mobileUser = await this.mobileUsersService.createAnonymous(
      dto.deviceId,
      dto.deviceInfo,
    );

    const token = this.generateToken(mobileUser);

    return {
      access_token: token,
      user: {
        id: mobileUser.id,
        username: mobileUser.username,
        isAnonymous: mobileUser.isAnonymous,
        deviceId: mobileUser.deviceId,
      },
    };
  }

  // ========== LOGIN CON DEVICE ==========

  async loginWithDevice(dto: DeviceLoginDto) {
    const mobileUser = await this.mobileUsersService.findByDeviceId(dto.deviceId);
    
    if (!mobileUser) {
      throw new UnauthorizedException('Dispositivo no registrado');
    }

    const token = this.generateToken(mobileUser);

    return {
      access_token: token,
      user: {
        id: mobileUser.id,
        username: mobileUser.username,
        email: mobileUser.email,
        isAnonymous: mobileUser.isAnonymous,
        deviceId: mobileUser.deviceId,
      },
    };
  }

  // ========== REGISTRAR CIUDADANO ==========

  async registerCitizen(dto: CompleteProfileDto & { deviceId?: string; deviceInfo?: any }) {
    const mobileUser = await this.mobileUsersService.registerCitizen(
      dto.email,
      dto.password,
      dto.username,
      dto.deviceId,
      dto.deviceInfo,
    );

    const token = this.generateToken(mobileUser);

    return {
      access_token: token,
      user: {
        id: mobileUser.id,
        username: mobileUser.username,
        email: mobileUser.email,
        isAnonymous: false,
      },
    };
  }

  // ========== COMPLETAR PERFIL ==========

  async completeProfile(mobileUserId: number, dto: CompleteProfileDto) {
    const mobileUser = await this.mobileUsersService.completeProfile(
      mobileUserId,
      dto.email,
      dto.password,
      dto.username,
    );

    const token = this.generateToken(mobileUser);

    return {
      access_token: token,
      user: {
        id: mobileUser.id,
        username: mobileUser.username,
        email: mobileUser.email,
        isAnonymous: mobileUser.isAnonymous,
      },
    };
  }

  // ========== LOGIN CIUDADANO/BOMBERO (USERNAME/PASSWORD) ==========

  async loginCitizen(username: string, password: string) {
    // 1. Buscar primero en MobileUser (ciudadanos)
    const mobileUser = await this.mobileUsersService.findByUsername(username);
    
    if (mobileUser) {
      // Validar contraseña de MobileUser
      const isValid = await this.mobileUsersService.validatePassword(mobileUser, password);
      if (!isValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const token = this.generateToken(mobileUser);

      return {
        access_token: token,
        user: {
          id: mobileUser.id,
          username: mobileUser.username,
          email: mobileUser.email,
          isAnonymous: mobileUser.isAnonymous,
        },
      };
    }

    // 2. Si no existe en MobileUser, buscar en User (bomberos)
    const webUser = await this.usersService.findByUsername(username);
    
    if (!webUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar contraseña de User (bomberos)
    const isValidWebUser = await bcrypt.compare(password, webUser.password);
    if (!isValidWebUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token para bombero
    const token = this.generateTokenForWebUser(webUser);

    return {
      access_token: token,
      user: {
        id: webUser.id,
        username: webUser.username,
        email: webUser.email,
        isAnonymous: false,
      },
    };
  }

  // ========== GENERAR TOKEN (MobileUser) ==========

  private generateToken(mobileUser: any) {
    const payload = {
      sub: mobileUser.id,
      username: mobileUser.username,
      roles: ['CITIZEN'],
      isAnonymous: mobileUser.isAnonymous,
      deviceId: mobileUser.deviceId,
      isMobileUser: true,
    };

    return this.jwtService.sign(payload);
  }

  // ========== GENERAR TOKEN (User web - Bomberos) ==========

  private generateTokenForWebUser(webUser: any) {
    const payload = {
      sub: webUser.id,
      username: webUser.username,
      roles: webUser.roles?.map((r: any) => r.name) || ['BOMBERO'],
      isAnonymous: false,
      isMobileUser: false,
    };

    return this.jwtService.sign(payload);
  }
}