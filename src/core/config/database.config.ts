import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from 'src/shared/types/config/db.config.type';

export default registerAs(
  'db',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'password',
    database: process.env.DB_NAME ?? 'vals_api_db',
  }),
);
