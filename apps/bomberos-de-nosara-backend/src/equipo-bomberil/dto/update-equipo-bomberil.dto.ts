import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoBomberilDto } from './create-equipo-bomberil.dto';

export class UpdateEquipoBomberilDto extends PartialType(CreateEquipoBomberilDto) {}
