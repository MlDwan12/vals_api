import { Module } from '@nestjs/common';
import { Faq } from './entities/faq.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqService } from './faq.service';
import { FaqRepository } from './faq.repository';
import { FaqController } from './faq.controller';
import { FaqSearchReindexService } from './faq-search-reindex.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Faq]), SearchModule],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository, FaqSearchReindexService],
  exports: [FaqService],
})
export class FaqModule {}
