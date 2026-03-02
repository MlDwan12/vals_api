import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorsInterceptor } from './cors.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CorsInterceptor,
    },
  ],
})
export class CorsModule {}
