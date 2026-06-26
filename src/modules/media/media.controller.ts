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
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetMediaDto } from './dto/get-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getMedia(@Query() query: GetMediaDto) {
    return this.mediaService.getMedia(query);
  }

  @Post()
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
          return cb(new BadRequestException('Разрешены только WEBP файлы'), false);
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
