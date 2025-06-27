// src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/roles/role.enum';

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
