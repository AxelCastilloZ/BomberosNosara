import { IsString, IsNotEmpty } from 'class-validator';

export class DeviceLoginDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}