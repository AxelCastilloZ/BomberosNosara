import { PartialType } from '@nestjs/mapped-types';
import { CreateMobileUserDto } from './create-mobile-user.dto';

export class UpdateMobileUserDto extends PartialType(CreateMobileUserDto) {}
