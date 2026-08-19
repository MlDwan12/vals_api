import { Controller, Get, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TagShortDto } from './dto/tag-short.dto';

@ApiTags('Теги')
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Список тегов, использованных в опубликованном контенте (фильтр на сайте)' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['article', 'case'],
    description: 'Сузить до тегов, использованных только в статьях/только в кейсах. Без параметра — объединение обоих.',
  })
  @ApiOkResponse({ description: 'Список тегов' })
  async getPublicList(@Query('type') type?: string): Promise<TagShortDto[]> {
    const normalizedType = type === 'article' || type === 'case' ? type : undefined;
    return this.service.findPublicList(normalizedType);
  }
}
