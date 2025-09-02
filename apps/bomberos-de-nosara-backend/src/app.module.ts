import { join } from 'path';
import { existsSync } from 'fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';

import { DonantesModule } from './donantes/donantes.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { SeederModule } from './seeder/seeder.module';
import { NoticiaModule } from './noticias/noticia.module';
import { SugerenciaModule } from './suggestion/suggestion.module';
import { EquipoBomberilModule } from './equipo-bomberil/equipo-bomberil.module';
import { MaterialEducativoModule } from './material-educativo/material-educativo.module';
import { UploadModule } from './upload/upload.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { AppMobileModule } from './app-mobile/app-mobile.module';
<<<<<<< HEAD
import { VoluntariosModule } from './voluntarios/voluntarios.module';
=======
import { ChatModule } from './chat/chat.module'; // <-- agregado
>>>>>>> 5c7910d9a0d3e55e6f217389948b91cc839509f5

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

        // --- DB (requeridos) ---
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        // --- Auth / App ---
        JWT_SECRET: Joi.string().min(32).required(),
        APP_BASE_URL: Joi.string().uri().default('http://localhost:5173'),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),

        // --- Mail (opcionales) ---
        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().optional(),
        SMTP_USER: Joi.string().optional(),
        SMTP_PASS: Joi.string().optional(),
        MAIL_FROM: Joi.string().optional(),

        // --- Seeder (requeridos) ---
        ADMIN_USERNAME: Joi.string().required(),
        ADMIN_EMAIL: Joi.string().email().required(),
        ADMIN_PASSWORD: Joi.string().min(8).required(),
        BCRYPT_ROUNDS: Joi.number().default(10),

        // --- Flags TypeORM (no sensibles) ---
        DB_SYNC: Joi.boolean().default(true),
        DB_DROP_SCHEMA: Joi.boolean().default(false),
      }),
    }),

<<<<<<< HEAD
    // Rate limiting global (v5: ttl en milisegundos)
=======
    // Rate limiting global
>>>>>>> 5c7910d9a0d3e55e6f217389948b91cc839509f5
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Archivos estáticos (uploads)
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
        synchronize: cfg.get<boolean>('DB_SYNC', true),
        dropSchema: cfg.get<boolean>('DB_DROP_SCHEMA', false),
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

<<<<<<< HEAD
=======
    // --- Módulos de la app (se conservan TODOS) ---
>>>>>>> 5c7910d9a0d3e55e6f217389948b91cc839509f5
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
<<<<<<< HEAD
    VoluntariosModule,
=======

    // --- Cambios de la compañera ---
    ChatModule, // <-- agregado
>>>>>>> 5c7910d9a0d3e55e6f217389948b91cc839509f5
  ],
})
export class AppModule {}
