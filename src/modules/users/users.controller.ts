import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './enums/user-role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('Пользователи')
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

  // @Post()
  // @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  // @ApiOperation({ summary: 'Создать пользователя' })
  // async createUser(@Body() dto: CreateUserDto): Promise<void> {
  //   return this.service.createUser(dto);
  // }

  @Post()
  @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать обычного пользователя' })
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createUser(dto);
  }

  @Post('moderators')
  @UseGuards(JwtAuthGuard, RolesGuard, DomainRestrictionGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать модератора (только для администратора)' })
  async createModerator(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createModerator(dto);
  }
}
