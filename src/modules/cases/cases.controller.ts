import { Controller, Get, Param } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Case } from './entities/case.entity';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';

@ApiTags('Кейсы')
@Controller('cases')
export class CasesController extends BaseCrudController<
  Case,
  CreateCaseDto,
  UpdateCaseDto
> {
  protected entityName: string;

  constructor(protected readonly service: CasesService) {
    super(service);
  }

  @Get('all/main-info')
  async getMainCaseInfoList() {
    try {
      return await this.service.findListCaseMainInfo();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('service/:slug')
  async getCasesByServiceSlug(@Param('slug') slug: string) {
    try {
      return await this.service.getCasesByServiceSlug(slug);
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('info/case/:slug')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  @ApiBearerAuth()
  async findBySlug(@Param('slug') slug: string) {
    if (slug) return this.service.getCaseBySlug(slug);
  }
}
