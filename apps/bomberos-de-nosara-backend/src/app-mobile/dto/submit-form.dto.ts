import { IsString, IsObject, IsOptional } from 'class-validator';

export class SubmitFormDto {

  @IsString()
  formKey!: string;

 
  @IsObject()
  payload!: Record<string, any>;


  @IsOptional() @IsObject() meta?: Record<string, any>;
}
