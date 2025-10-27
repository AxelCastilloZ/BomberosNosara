import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content?: string;

  @IsNumber()
  @IsNotEmpty()
  conversationId?: number;

  @IsNumber()
  @IsNotEmpty()
  senderId?: number;
}
