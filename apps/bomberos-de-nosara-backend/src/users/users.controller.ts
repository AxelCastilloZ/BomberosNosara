
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtener todos los usuarios
   * - Ejemplo para traer todos: GET /users
   * - Ejemplo para filtrar por rol: GET /users?role=admin
   */
  @Get()
  findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  /**
   * Crear usuario
   */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Actualizar usuario por ID
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  /**
   * Eliminar usuario por ID
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Buscar usuario por username
   */
  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
