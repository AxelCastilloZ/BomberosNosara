import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
 
  // Crear directorios de uploads
  const uploadDir = join(process.cwd(), 'uploads');
  const donorsDir = join(uploadDir, 'donantes');
  if (!existsSync(uploadDir)) mkdirSync(uploadDir);
  if (!existsSync(donorsDir)) mkdirSync(donorsDir);

  
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // WebSocket adapter con configuración CORS
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

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  
  app.useGlobalFilters(
    new TypeOrmExceptionFilter(), 
    new AllExceptionsFilter()    
  );

  await app.listen(3000);
}

bootstrap();