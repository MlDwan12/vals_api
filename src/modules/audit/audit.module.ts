import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditLogController } from './audit-log.controller';
import { AuditInterceptor } from 'src/common/interceptors/audit.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/http-exception.filter';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [AuditLogController],
  exports: [AuditService],
})
export class AuditModule {}
