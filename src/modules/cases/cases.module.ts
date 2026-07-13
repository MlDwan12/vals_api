import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { CaseFaq } from './entities/case-faq.entity';
import { CasesService } from './cases.service';
import { CaseRepository } from './cases.repository';
import { CasesController } from './cases.controller';
import { CasesAdminController } from './cases-admin.controller';
import { ServicesModule } from '../services/services.module';
import { SearchModule } from '../search/search.module';
import { CaseSearchReindexService } from './case-search-reindex.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case, CaseFaq]),
    ServicesModule,
    SearchModule,
  ],
  controllers: [CasesController, CasesAdminController],
  providers: [CasesService, CaseRepository, CaseSearchReindexService],
  exports: [CasesService],
})
export class CasesModule {}
