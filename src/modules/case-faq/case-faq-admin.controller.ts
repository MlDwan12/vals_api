import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CaseFaqService } from './case-faq.service';
import { CreateCaseFaqDto } from './dto/create-case-faq.dto';
import { UpdateCaseFaqDto } from './dto/update-case-faq.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { CaseFaq } from '../cases/entities/case-faq.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('FAQ кейсов (админ)')
@Controller('admin/case-faq')
export class CaseFaqAdminController extends BaseCrudController<
  CaseFaq,
  CreateCaseFaqDto,
  UpdateCaseFaqDto
> {
  protected entityName: string;

  constructor(protected readonly service: CaseFaqService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<CaseFaq>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CaseFaq> {
    return this.service.findById(id);
  }
}
