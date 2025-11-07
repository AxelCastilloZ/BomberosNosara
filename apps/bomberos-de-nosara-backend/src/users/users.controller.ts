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
  ParseIntPipe,
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
   * NUEVO ENDPOINT: Obtener usuario por ID numérico
   * Específico para auditoría y referencias por ID
   * GET /users/id/1
   */
  @Get('id/:id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
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
   * Eliminar usuario por ID (Soft Delete)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Restaurar usuario desactivado
   * POST /users/5/restore
   */
  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  /**
   * Buscar usuario por username
   * MANTENER AL FINAL para no interferir con otras rutas
   */
  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}