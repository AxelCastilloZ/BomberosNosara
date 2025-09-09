import 'reflect-metadata';

import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';

const SRC_ROOT = path.resolve(__dirname, '../..'); // .../src

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'mi_app',
  charset: 'utf8mb4',
  synchronize: false,       // con migraciones, siempre false
  logging: false,

  // Soporta ejecutar en TS (dev) y JS (dist)
  entities: [path.join(SRC_ROOT, '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});

// ⬅️ IMPORTANTE: **solo una** exportación de DataSource
export default AppDataSource;
