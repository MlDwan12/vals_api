import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 секунд
        limit: 100, // 100 запросов по умолчанию
        // Можно переопределить для конкретных роутов через @Throttle()
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}

// @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 запросов в минуту
// @Post('login')
// login() { ... }
