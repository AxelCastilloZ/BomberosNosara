import { IsArray, IsNumber, IsString, ArrayNotEmpty, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateGroupConversationDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1, { message: 'At least one participant is required' })
  @IsNumber({}, { each: true })
  participantIds?: number[];
  @IsString()
  @IsOptional()
  groupName?: string;
}
