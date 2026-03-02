import { Module } from '@nestjs/common';
import { Industry } from './entities/industry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';
import { IndustryRepository } from './industry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustryController],
  providers: [IndustryService, IndustryRepository],
  exports: [IndustryService],
})
export class IndustryModule {}
