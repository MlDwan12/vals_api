import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleFaq } from '../articles/entities/article-faq.entity';
import { ArticleFaqService } from './article-faq.service';
import { ArticleFaqRepository } from './article-faq.repository';
import { ArticleFaqAdminController } from './article-faq-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleFaq])],
  controllers: [ArticleFaqAdminController],
  providers: [ArticleFaqService, ArticleFaqRepository],
  exports: [ArticleFaqService],
})
export class ArticleFaqModule {}
