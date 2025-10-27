
import { IsString, IsArray, ArrayNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;              

  @IsString()
  @MinLength(8)
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];             
}
