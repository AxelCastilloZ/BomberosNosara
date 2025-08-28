import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadDir = join(process.cwd(), 'uploads');
  const donorsDir = join(uploadDir, 'donantes');

 if (!existsSync(uploadDir)) mkdirSync(uploadDir);
if (!existsSync(donorsDir)) mkdirSync(donorsDir);

  app.enableCors({
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos de uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(3000);
}
bootstrap();
