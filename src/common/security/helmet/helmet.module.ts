import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HelmetGuard } from './helmet.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: HelmetGuard,
    },
  ],
})
export class HelmetModule {}
