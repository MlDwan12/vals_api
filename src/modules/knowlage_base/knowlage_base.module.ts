import { Module } from '@nestjs/common';
import { KnowlageBaseService } from './knowlage_base.service';
import { KnowlageBaseController } from './knowlage_base.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowlageBase } from './entities/knowlage_base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowlageBase])],
  controllers: [KnowlageBaseController],
  providers: [KnowlageBaseService],
})
export class KnowlageBaseModule {}
