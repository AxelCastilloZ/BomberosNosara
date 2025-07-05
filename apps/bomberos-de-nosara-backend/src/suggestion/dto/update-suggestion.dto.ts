import { PartialType } from '@nestjs/mapped-types';
import { CreateSugerenciaDto } from './create-suggestion.dto';

export class UpdateSugerenciaDto extends PartialType(CreateSugerenciaDto) {}