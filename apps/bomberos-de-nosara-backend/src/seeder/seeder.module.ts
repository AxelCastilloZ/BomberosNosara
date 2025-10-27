
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SeederService } from './seeder.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AuthModule } from '../auth/auth.module'; // 👈

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    ConfigModule,
    forwardRef(() => AuthModule), 
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
