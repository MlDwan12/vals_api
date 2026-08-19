import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetMediaDto } from './dto/get-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getMedia(@Query() query: GetMediaDto) {
    return this.mediaService.getMedia(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'WEBP файлы (макс. 10 шт., до 200 КБ каждый)',
        },
        alt: {
          type: 'array',
          items: { type: 'string' },
          description: 'Alt-тексты для каждого файла (по порядку)',
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 200 * 1024,
        files: 10,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/webp') {
          return cb(
            new BadRequestException('Разрешены только WEBP файлы'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Файлы не загружены');
    }
    return this.mediaService.upload(files, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
