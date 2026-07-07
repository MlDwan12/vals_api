import { Module } from '@nestjs/common';
import { ImageLibService } from './image-lib.service';
import { ImageLibAdminController } from './image-lib-admin.controller';
import { ImageLib } from './entities/image-lib.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageLibRepository } from './image-lib.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImageLib])],
  controllers: [ImageLibAdminController],
  providers: [ImageLibService, ImageLibRepository],
  exports: [ImageLibService],
})
export class ImageLibModule {}
