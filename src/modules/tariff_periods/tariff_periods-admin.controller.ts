import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TariffPeriod } from './entities/tariff_period.entity';
import { UpdateTariffPeriodDto } from './dto/update-tariff_period.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { TariffPeriodsService } from './tariff_periods.service';
import { CreateTariffPeriodDto } from './dto/create-tariff_period.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Периоды тарифов (админ)')
@Controller('admin/tariff-periods')
export class TariffPeriodsAdminController extends BaseCrudController<
  TariffPeriod,
  CreateTariffPeriodDto,
  UpdateTariffPeriodDto
> {
  protected entityName: string;

  constructor(protected readonly service: TariffPeriodsService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<TariffPeriod>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<TariffPeriod> {
    return this.service.findById(id);
  }
}
