
import { IsString, IsArray, IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString()
  username?: string;

  @IsOptional() @IsEmail()
  email?: string;               

  @IsOptional() @IsString() @MinLength(8)
  password?: string;

  @IsOptional() @IsArray()
  roles?: string[];
}
