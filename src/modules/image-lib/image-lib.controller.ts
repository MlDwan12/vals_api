import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { ImageLibService } from './image-lib.service';
import { CreateImageLibDto } from './dto/create-image-lib.dto';
import { UpdateImageLibDto } from './dto/update-image-lib.dto';
import { ImageLib } from './entities/image-lib.entity';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { buildImageLibDestinationAbs } from './image-lib-path.util';

@Controller('image-lib')
export class ImageLibController extends BaseCrudController<
  ImageLib,
  CreateImageLibDto,
  UpdateImageLibDto
> {
  protected entityName: string;

  constructor(protected readonly service: ImageLibService) {
    super(service);
  }
  @Get('all')
  async getMainCaseInfoList() {
    try {
      return await this.service.findAll();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = buildImageLibDestinationAbs();

          try {
            mkdirSync(dest, { recursive: true });
            cb(null, dest);
          } catch (error) {
            cb(error as Error, dest);
          }
        },
        filename: (req, file, cb) => {
          const safeExt = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${safeExt}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = new Set([
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
        ]);

        if (!allowedMimeTypes.has(file.mimetype)) {
          return cb(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ImageLib[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.service.createManyFromUploadedFiles(files);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.removeWithFile(id);
  }
}
