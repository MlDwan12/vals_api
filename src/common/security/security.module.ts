import { Module } from '@nestjs/common';

@Module({
  imports: [
    // HelmetModule,
    // CorsModule,
    // RateLimitModule,
    // ValidationModule,
    // CsrfModule, // подключай только если используешь cookies и SSR/SSR-like
  ],
  exports: [
    // HelmetModule,
    // CorsModule,
    // RateLimitModule,
    // ValidationModule,
    // CsrfModule,
  ],
})
export class SecurityModule {}
