import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
import { BaseCrudController } from 'src/core/crud/base.controller';

@ApiTags('Услуги')
@Controller('services')
export class ServicesController extends BaseCrudController<
  Service,
  CreateServiceDto,
  UpdateServiceDto
> {
  protected entityName: string;

  constructor(protected readonly service: ServicesService) {
    super(service);
  }

  @Get('all/info')
  async findAllWithRelations() {
    try {
      return await this.service.findAllWithRelations();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('all/short-info')
  async getShortServiceInfoList() {
    try {
      return await this.service.findListServiceShortInfo();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('all/main-info')
  async getMainServiceInfoList() {
    try {
      return await this.service.findListServiceMainInfo();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('all/full-info')
  async getFullServiceInfoList() {
    try {
      return await this.service.findListServiceFullInfo();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('list/faq')
  async getListServicesWithFaq() {
    try {
      return await this.service.getListServicesWithFaq();
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить элемент по ID' })
  @ApiOkResponse({ description: 'Элемент найден' })
  @ApiNotFoundResponse({ description: 'Элемент не найден' })
  async getServiceInfo(@Param('slug') slug: string) {
    try {
      return await this.service.findOneByIDWithRelations(slug);
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }
}
