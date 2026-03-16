import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource, type DataSourceOptions } from 'typeorm';

loadEnv();

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPortRaw = process.env.DB_PORT ?? '5432';
const dbUser = process.env.DB_USER ?? 'postgres';
const dbPassword = process.env.DB_PASS ?? 'postgres';
const dbName = process.env.DB_NAME ?? 'vals_api';

const dbPort = Number(dbPortRaw);

if (Number.isNaN(dbPort)) {
  throw new Error(`Invalid DB_PORT value: "${dbPortRaw}"`);
}

export const appDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [join(__dirname, 'modules/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
};

const appDataSource = new DataSource(appDataSourceOptions);

export default appDataSource;
