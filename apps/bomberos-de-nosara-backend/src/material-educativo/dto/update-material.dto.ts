import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @IsOptional()
  @IsString()
  area?: string;
}
