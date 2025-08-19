// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param } from '@nestjs/common';
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
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
};