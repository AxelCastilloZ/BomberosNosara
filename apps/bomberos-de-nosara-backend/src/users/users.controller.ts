// src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@Controller('users') 
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RoleEnum.SUPERUSER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll(); 
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto); 
  }
}
