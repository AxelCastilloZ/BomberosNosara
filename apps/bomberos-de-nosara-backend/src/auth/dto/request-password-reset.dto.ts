// src/auth/dto/request-password-reset.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  email!: string; 
}
