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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CLIENT_ROLES } from 'src/common/constants/roles.constant';
import { ClientContactEntity } from '../entities/client-contact.entity';
import { ClientContactQueryDto } from '../dto/client-contact-query.dto';
import { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';
import { ClientContactService } from '../services/client-contact.service';

@ApiTags('client-contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CLIENT_ROLES)
@Controller('client-contacts')
export class ClientContactAdminController {
  constructor(private readonly clientContactService: ClientContactService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список контактов клиентов' })
  @ApiOkResponse({ description: 'Список контактов клиентов' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async paginate(
    @Query() query: ClientContactQueryDto,
  ): Promise<PaginationResult<ClientContactEntity>> {
    return this.clientContactService.paginate(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить контакт клиента по ID' })
  @ApiOkResponse({ description: 'Контакт клиента найден' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ClientContactEntity> {
    return this.clientContactService.findById(id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Получить контакты конкретного клиента' })
  @ApiOkResponse({ description: 'Контакты клиента' })
  async findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientContactEntity[]> {
    return this.clientContactService.findByClientId(clientId);
  }
}
