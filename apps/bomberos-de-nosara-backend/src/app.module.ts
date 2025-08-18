import * as crypto from 'crypto';
import { join } from 'path';
import { existsSync } from 'fs';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DonantesModule } from './donantes/donantes.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { SeederModule } from './seeder/seeder.module';
import { NoticiaModule } from './noticias/noticia.module';
import { SugerenciaModule } from './suggestion/suggestion.module';
import { EquipoBomberilModule } from './equipo-bomberil/equipo-bomberil.module';
import { UploadModule } from './upload/upload.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const localPath=join(__dirname, '..', '.env');
        const dockerPath='/app/.env';

        if (process.env.NODE_ENV==='production') {
          return existsSync(dockerPath)? dockerPath:localPath;
        }

        return existsSync(localPath)? localPath:undefined;
      })(),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DATABASE_PORT', '3306'), 10),
        username: configService.get<string>('DATABASE_USER', 'root'),
        password: configService.get<string>('DATABASE_PASSWORD', ''),
        database: configService.get<string>('DATABASE_NAME', 'bomberosNosara'),
        synchronize: false,
        dropSchema: false,
        autoLoadEntities: true,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

    DonantesModule,
    NoticiaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SeederModule,
    SugerenciaModule,
    EquipoBomberilModule,
    UploadModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
