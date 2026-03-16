import { registerAs } from '@nestjs/config';
import type { SecurityConfig } from '../shared/types/config/security.config.type';

export default registerAs(
  'security',
  (): SecurityConfig => ({
    allowedMutationOrigins: (
      process.env.ALLOWED_MUTATION_ORIGINS ?? 'http://localhost:3000'
    )
      .split(',')
      .map((origin: string) => origin.trim())
      .filter((origin: string) => origin.length > 0),
  }),
);
