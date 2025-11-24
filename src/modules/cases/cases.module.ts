import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case])],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}
