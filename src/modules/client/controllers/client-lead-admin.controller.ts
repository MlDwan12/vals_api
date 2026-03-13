import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ClientLeadAdminService } from '../services/client-lead-admin.service';
import { ClientLeadEntity } from '../entities/client-lead.entity';
import { ClientLeadQueryDto } from '../dto/client-lead-query.dto';
import { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';
import { ClientLeadListItemDto } from '../dto/client-lead-list-item.dto';

@ApiTags('client-leads')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('client-leads')
export class ClientLeadAdminController {
  constructor(
    private readonly clientLeadAdminService: ClientLeadAdminService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить список заявок клиентов' })
  @ApiOkResponse({ description: 'Список заявок клиентов' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async paginate(
    @Query() query: ClientLeadQueryDto,
  ): Promise<PaginationResult<ClientLeadEntity>> {
    return this.clientLeadAdminService.paginate(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заявку клиента по ID' })
  @ApiOkResponse({ description: 'Заявка клиента найдена' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ClientLeadEntity> {
    return this.clientLeadAdminService.findById(id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получить заявки конкретного клиента' })
  @ApiOkResponse({ description: 'Список заявок клиента' })
  async findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientLeadListItemDto[]> {
    return this.clientLeadAdminService.findByClientId(clientId);
  }
}
