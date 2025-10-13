import { IsString, IsNotEmpty } from 'class-validator';

export class LoginCitizenDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}