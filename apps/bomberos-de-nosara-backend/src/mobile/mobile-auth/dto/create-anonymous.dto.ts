import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateAnonymousDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    platform: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
}