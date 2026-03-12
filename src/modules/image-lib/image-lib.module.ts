import { Module } from '@nestjs/common';
import { ImageLibService } from './image-lib.service';
import { ImageLibController } from './image-lib.controller';
import { ImageLib } from './entities/image-lib.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageLibRepository } from './image-lib.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImageLib])],
  controllers: [ImageLibController],
  providers: [ImageLibService, ImageLibRepository],
  exports: [ImageLibService],
})
export class ImageLibModule {}
