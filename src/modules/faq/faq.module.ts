import { Module } from '@nestjs/common';
import { Faq } from './entities/faq.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqService } from './faq.service';
import { FaqRepository } from './faq.repository';
import { FaqController } from './faq.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService],
})
export class FaqModule {}
