import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Delete,
  Post,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientService } from '../services/client.service';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { FindOptionsWhere, ILike } from 'typeorm';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CLIENT_ROLES } from 'src/common/constants/roles.constant';

@ApiTags('Клиенты (админ)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CLIENT_ROLES)
@Controller('admin/client')
export class ClientAdminController extends BaseCrudController<
  Client,
  CreateClientDto,
  UpdateClientDto
> {
  protected entityName: string;

  constructor(protected readonly service: ClientService) {
    super(service);
  }

  @Get()
  async getListClient(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('search') search?: string,
  ) {
    const normalizedSearch = search?.trim();

    const where: FindOptionsWhere<Client>[] | undefined = normalizedSearch
      ? [
          { primaryPhone: ILike(`%${normalizedSearch}%`) },
          { primaryEmail: ILike(`%${normalizedSearch}%`) },
        ]
      : undefined;

    return this.service.paginate(
      {
        select: {
          id: true,
          name: true,
          primaryPhone: true,
          primaryEmail: true,
          leadsCount: true,
          lastLeadAt: true,
          createdAt: true,
        },
        where,
      },
      { page, limit },
    );
  }

  @Post()
  @UseGuards(DomainRestrictionGuard)
  async create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(DomainRestrictionGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
  ): Promise<Client> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(DomainRestrictionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(id);
  }
}
