import { IsString, IsEmail, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class CompleteProfileDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}