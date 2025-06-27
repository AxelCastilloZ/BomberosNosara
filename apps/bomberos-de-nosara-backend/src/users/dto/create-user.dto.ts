
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsArray()
  @ArrayNotEmpty()
  roles!: string[]; 
}
