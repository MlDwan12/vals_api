import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { FindOptionsWhere, ILike } from 'typeorm';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('client')
export class ClientController extends BaseCrudController<
  Client,
  CreateClientDto,
  UpdateClientDto
> {
  protected entityName: string;

  constructor(protected readonly service: ClientService) {
    super(service);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
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

    try {
      return await this.service.paginate(
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
    } catch (e) {
      console.error('REAL ERROR:', e);
      throw e;
    }
  }
}
