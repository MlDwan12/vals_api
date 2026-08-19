import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import { TagWithCountsDto } from './dto/tag-with-counts.dto';

@ApiTags('Теги (админ)')
@Controller('admin/tags')
export class TagsAdminController extends BaseCrudController<Tag, CreateTagDto, UpdateTagDto> {
  protected entityName!: string;

  constructor(protected readonly service: TagsService) {
    super(service);
  }

  // Переопределяет базовую paginate() — тегов мало, таблице в админке пагинация не нужна,
  // зато нужны articlesCount/casesCount.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех тегов с количеством статей/кейсов (админ-таблица)' })
  async findAllWithCounts(): Promise<TagWithCountsDto[]> {
    return this.service.findAllWithCounts();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить тег по ID' })
  @ApiOkResponse({ description: 'Тег найден' })
  @ApiNotFoundResponse({ description: 'Тег не найден' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Tag> {
    return this.service.findById(id);
  }

  // POST()/PATCH(':id')/DELETE(':id') — унаследованы из BaseCrudController без изменений:
  // create()/update() вызывают переопределённые TagsService.create/update (идемпотентность + генерация slug),
  // remove() — стандартный hard delete (tag_id — ON DELETE CASCADE, статьи/кейсы не страдают).
}
