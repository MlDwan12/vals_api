import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseFaq } from '../cases/entities/case-faq.entity';
import { CaseFaqService } from './case-faq.service';
import { CaseFaqRepository } from './case-faq.repository';
import { CaseFaqAdminController } from './case-faq-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaseFaq])],
  controllers: [CaseFaqAdminController],
  providers: [CaseFaqService, CaseFaqRepository],
  exports: [CaseFaqService],
})
export class CaseFaqModule {}
