import { Controller, Get, Param } from '@nestjs/common';
import { CasesService } from './cases.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Кейсы')
@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get('service/:slug')
  async getCasesByServiceSlug(@Param('slug') slug: string) {
    return this.service.getCasesByServiceSlug(slug);
  }

  @Get('info/case/:slug')
  @ApiOperation({ summary: 'Получить кейс по slug (сайт)' })
  @ApiOkResponse({ description: 'Кейс найден' })
  @ApiNotFoundResponse({ description: 'Кейс не найден' })
  async findByCaseSlug(@Param('slug') slug: string) {
    return this.service.getCaseBySlug(slug);
  }
}
