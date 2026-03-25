import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { CasesService } from './cases.service';
import { CaseRepository } from './cases.repository';
import { CasesController } from './cases.controller';
import { ServicesModule } from '../services/services.module';
import { SearchModule } from '../search/search.module';
import { CaseSearchReindexService } from './case-search-reindex.service';

@Module({
  imports: [TypeOrmModule.forFeature([Case]), ServicesModule, SearchModule],
  controllers: [CasesController],
  providers: [CasesService, CaseRepository, CaseSearchReindexService],
  exports: [CasesService],
})
export class CasesModule {}
