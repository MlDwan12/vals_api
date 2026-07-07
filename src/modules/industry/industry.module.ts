import { Module } from '@nestjs/common';
import { Industry } from './entities/industry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryAdminController } from './industry-admin.controller';
import { IndustryService } from './industry.service';
import { IndustryRepository } from './industry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Industry])],
  controllers: [IndustryAdminController],
  providers: [IndustryService, IndustryRepository],
  exports: [IndustryService],
})
export class IndustryModule {}
