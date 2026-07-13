import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagShortDto } from './dto/tag-short.dto';

@ApiTags('Теги')
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Список тегов, использованных в опубликованном контенте (фильтр на сайте)' })
  @ApiOkResponse({ description: 'Список тегов' })
  async getPublicList(): Promise<TagShortDto[]> {
    return this.service.findPublicList();
  }
}
