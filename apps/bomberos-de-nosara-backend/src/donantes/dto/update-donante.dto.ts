import { PartialType } from '@nestjs/mapped-types';
import { CreateDonanteDto } from './create-donante.dto';

export class UpdateDonanteDto extends PartialType(CreateDonanteDto) {}
