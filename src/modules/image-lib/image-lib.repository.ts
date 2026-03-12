import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageLib } from './entities/image-lib.entity';

@Injectable()
export class ImageLibRepository extends BaseCrudRepository<ImageLib> {
  constructor(
    @InjectRepository(ImageLib)
    repo: Repository<ImageLib>,
  ) {
    super(repo, ImageLib);
  }
}
