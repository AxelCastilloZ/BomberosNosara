import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import * as Joi from 'joi';
import { join } from 'path';

import { AppMobileModule } from './app-mobile/app-mobile.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DonantesModule } from './donantes/donantes.module';
import { EquipoBomberilModule } from './equipo-bomberil/equipo-bomberil.module';
import { MaterialEducativoModule } from './material-educativo/material-educativo.module';
import { NoticiaModule } from './noticias/noticia.module';
import { RolesModule } from './roles/roles.module';
import { SeederModule } from './seeder/seeder.module';
import { SugerenciaModule } from './suggestion/suggestion.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: (() => {
        const localPath = join(__dirname, '..', '.env');
        const dockerPath = '/app/.env';
        if (process.env.NODE_ENV === 'production') {
          return existsSync(dockerPath) ? dockerPath : localPath;
        }
        return existsSync(localPath) ? localPath : undefined;
      })(),
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        JWT_SECRET: Joi.string().min(32).required(),
        APP_BASE_URL: Joi.string().uri().default('http://localhost:5173'),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),

        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().optional(),
        SMTP_USER: Joi.string().optional(),
        SMTP_PASS: Joi.string().optional(),
        MAIL_FROM: Joi.string().optional(),

        ADMIN_USERNAME: Joi.string().required(),
        ADMIN_EMAIL: Joi.string().email().required(),
        ADMIN_PASSWORD: Joi.string().min(8).required(),
        BCRYPT_ROUNDS: Joi.number().default(10),

        DB_SYNC: Joi.boolean().default(true),
        DB_DROP_SCHEMA: Joi.boolean().default(false),
      }),
    }),

    // Rate limiting global (v5: ttl en milisegundos)
    // Rate limiting global

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    EventEmitterModule.forRoot(),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql' as const,
        host: cfg.getOrThrow<string>('DATABASE_HOST'),
        port: cfg.getOrThrow<number>('DATABASE_PORT'),
        username: cfg.getOrThrow<string>('DATABASE_USER'),
        password: cfg.getOrThrow<string>('DATABASE_PASSWORD'),
        database: cfg.getOrThrow<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: cfg.get<boolean>('DB_SYNC', false),
        dropSchema: cfg.get<boolean>('DB_DROP_SCHEMA', false),
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

    // --- Módulos de la app (se conservan TODOS) ---
    DonantesModule,
    NoticiaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    SeederModule,
    SugerenciaModule,
    EquipoBomberilModule,
    UploadModule,
    MaterialEducativoModule,
    VehiculosModule,
    WebSocketsModule,
    AppMobileModule,
    VoluntariosModule,
    // --- Cambios de la compañera ---
    ChatModule, // <-- agregado
  ],
})
export class AppModule {}
