import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ImageLibService } from './image-lib.service';
import { CreateImageLibDto } from './dto/create-image-lib.dto';
import { UpdateImageLibDto } from './dto/update-image-lib.dto';
import { ImageLib } from './entities/image-lib.entity';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { buildImageLibDestinationAbs } from './image-lib-path.util';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async getAll() {
    return this.service.findAll();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = buildImageLibDestinationAbs();
          try {
            mkdirSync(dest, { recursive: true });
            cb(null, dest);
          } catch (error) {
            cb(error as Error, dest);
          }
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${safeExt}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = new Set([
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
        ]);
        if (!allowedMimeTypes.has(file.mimetype)) {
          return cb(
            new BadRequestException(`Неподдерживаемый тип файла: ${file.mimetype}`),
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
      throw new BadRequestException('Файлы не загружены');
    }
    return this.service.createManyFromUploadedFiles(files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.removeWithFile(id);
  }
}
