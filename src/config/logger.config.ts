import { registerAs } from '@nestjs/config';
import { LoggerConfig } from 'src/shared/types/config/logger.config.type';

export default registerAs(
  'logger',
  (): LoggerConfig => ({
    level: process.env.LOG_LEVEL ?? 'info',
    pretty: process.env.LOG_PRETTY === 'true',
    translateTime: 'SYS:standard',
  }),
);
