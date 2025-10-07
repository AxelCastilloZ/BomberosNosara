import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MobileUsersService } from '../mobile-users/mobile-users.service';
import { CreateAnonymousDto } from './dto/create-anonymous.dto';
import { DeviceLoginDto } from './dto/device-login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class MobileAuthService {
  constructor(
    private readonly mobileUsersService: MobileUsersService,
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

  // ========== LOGIN CIUDADANO (EMAIL/PASSWORD) ==========

  async loginCitizen(email: string, password: string) {
    const mobileUser = await this.mobileUsersService.findByEmail(email);
    
    if (!mobileUser) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

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

  // ========== GENERAR TOKEN ==========

  private generateToken(mobileUser: any) {
    const payload = {
      sub: mobileUser.id,
      username: mobileUser.username,
      roles: ['CITIZEN'],
      isAnonymous: mobileUser.isAnonymous,
      deviceId: mobileUser.deviceId,
      isMobileUser: true, // Flag para distinguir de User web
    };

    return this.jwtService.sign(payload);
  }
}