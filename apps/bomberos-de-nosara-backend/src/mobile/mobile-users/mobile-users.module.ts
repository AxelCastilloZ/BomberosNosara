import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileUsersService } from './mobile-users.service';
import { MobileUser } from './entities/mobile-user.entity';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MobileUser]),
    UsersModule,
  ],
  providers: [MobileUsersService],
  exports: [MobileUsersService],
})
export class MobileUsersModule {}