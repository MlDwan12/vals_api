import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Услуги')
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Get('all/info')
  async findAllWithRelations() {
    return this.service.findAllWithRelations();
  }

  @Get('all/short-info')
  async getShortServiceInfoList() {
    return this.service.findListServiceShortInfo();
  }

  @Get('all/full-info')
  async getFullServiceInfoList() {
    return this.service.findListServiceFullInfo();
  }

  @Get('list/faq')
  async getListServicesWithFaq() {
    return this.service.getListServicesWithFaq();
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить услугу по slug (сайт)' })
  @ApiOkResponse({ description: 'Услуга найдена' })
  @ApiNotFoundResponse({ description: 'Услуга не найдена' })
  async getServiceInfo(@Param('slug') slug: string) {
    return this.service.findOneByIDWithRelations(slug);
  }
}
