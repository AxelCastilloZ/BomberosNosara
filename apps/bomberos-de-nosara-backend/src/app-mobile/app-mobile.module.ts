import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppMobileController } from './app-mobile.controller';
import { AppMobileService } from './app-mobile.service';
import { Report } from './entities/report.entity';
import { WebSocketsModule } from '../web-sockets/web-sockets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), WebSocketsModule],
  controllers: [AppMobileController],
  providers: [AppMobileService],
})
export class AppMobileModule {}
