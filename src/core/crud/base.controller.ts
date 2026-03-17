import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { PaginationResult } from './interfaces/pagination.interface';
import { BaseCrudService } from './base.service';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';

@ApiTags('crud')
export abstract class BaseCrudController<
  Entity extends { id: number },
  CreateDto,
  UpdateDto,
> {
  protected abstract entityName: string;

  protected service: BaseCrudService<Entity, CreateDto, UpdateDto>;

  constructor(service: BaseCrudService<Entity, CreateDto, UpdateDto>) {
    this.service = service;
  }

  @Post()
  // @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый элемент' })
  @ApiCreatedResponse({ description: 'Элемент успешно создан' })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateDto): Promise<Entity> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Entity> {
    return this.service.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список элементов (с пагинацией)' })
  @ApiOkResponse({ description: 'Пагинированный список' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() query: Record<string, any> = {},
  ): Promise<PaginationResult<Entity>> {
    const filters = { ...query };
    delete filters.page;
    delete filters.limit;

    const findOptions: FindManyOptions<Entity> = {};
    if (Object.keys(filters).length > 0) {
      findOptions.where = filters as FindOptionsWhere<Entity>;
    }

    return this.service.paginate(findOptions, { page, limit });
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент обновлён' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDto,
  ): Promise<Entity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить элемент по ID' })
  @ApiNoContentResponse({ description: 'Элемент удалён' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(id);
  }
}
