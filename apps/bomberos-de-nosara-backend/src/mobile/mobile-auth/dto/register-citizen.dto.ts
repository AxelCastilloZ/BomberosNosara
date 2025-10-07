import { IsEmail, IsString, MinLength, IsOptional, IsObject } from 'class-validator';

export class RegisterCitizenDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: any;
}