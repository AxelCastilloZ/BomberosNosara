import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnonymousDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsOptional()
  deviceInfo?: any; // ← Sin validación estricta
}