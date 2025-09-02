import { IsArray, IsNumber, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(1) // For 1:1 chat, we only need one other participant
  @IsNumber({}, { each: true })
  participantIds?: number[];
}
