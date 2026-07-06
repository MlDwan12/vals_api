import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ADMIN_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Пользователи')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController extends BaseCrudController<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected entityName!: string;

  constructor(protected readonly service: UsersService) {
    super(service);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiOperation({ summary: 'Создать контент-менеджера' })
  async createContentManager(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createContentManager(dto);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Создать администратора (только разработчик)' })
  async createAdmin(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createAdmin(dto);
  }

  @Post('client-managers')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(...ADMIN_ROLES)
  @ApiOperation({ summary: 'Создать менеджера по работе с клиентами' })
  async createClientManager(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createClientManager(dto);
  }

  @Get()
  @Roles(...ADMIN_ROLES)
  @ApiOperation({ summary: 'Список пользователей' })
  @ApiOkResponse({ description: 'Пагинированный список пользователей' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<User>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @Roles(...ADMIN_ROLES)
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiOkResponse({ description: 'Пользователь найден' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.service.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Обновить пользователя (только разработчик)' })
  @ApiOkResponse({ description: 'Пользователь обновлён' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(UserRole.DEVELOPER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить пользователя (только разработчик)' })
  @ApiNoContentResponse({ description: 'Пользователь удалён' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.remove(id);
  }
}
