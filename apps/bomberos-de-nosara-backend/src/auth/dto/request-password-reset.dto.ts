import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Email no válido' })
  email!: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'URL base no válida' })
  appBaseUrl?: string;
}
