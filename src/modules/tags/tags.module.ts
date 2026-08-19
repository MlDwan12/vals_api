import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagsAdminController } from './tags-admin.controller';
import { Tag } from './entities/tag.entity';
import { TagRepository } from './tags.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController, TagsAdminController],
  providers: [TagsService, TagRepository],
  exports: [TagRepository],
})
export class TagsModule {}
