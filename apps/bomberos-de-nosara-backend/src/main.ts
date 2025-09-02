import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';

// 👇 agregado para WebSockets (Socket.IO)
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // === Carpetas de uploads (base tuya) ===
  const uploadDir = join(process.cwd(), 'uploads');
  const donorsDir = join(uploadDir, 'donantes');

  if (!existsSync(uploadDir)) mkdirSync(uploadDir);
  if (!existsSync(donorsDir)) mkdirSync(donorsDir);

  // === CORS (fusiona lo de tu compañera) ===
  const corsOrigins = [
    'http://localhost:3000', // por si tu front corre en 3000
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // === WebSocket adapter con CORS (nuevo de tu compañera) ===
  const webSocketAdapter = new (class extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): any {
      const server = super.createIOServer(port, {
        ...options,
        cors: {
          origin: corsOrigins,
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });
      return server;
    }
  })(app);

  app.useWebSocketAdapter(webSocketAdapter);

  // === Pipes globales (base tuya) ===
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // === Servir /uploads (base tuya) ===
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // === Filtros globales (base tuya) ===
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  await app.listen(3000);
}
bootstrap();
