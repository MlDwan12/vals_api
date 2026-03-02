import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { CasesService } from './cases.service';
import { CaseRepository } from './cases.repository';
import { CasesController } from './cases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Case])],
  controllers: [CasesController],
  providers: [CasesService, CaseRepository],
  exports: [CasesService],
})
export class CasesModule {}
