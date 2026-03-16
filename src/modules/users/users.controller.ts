import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DomainRestrictionGuard } from 'src/common/guards/domain-restriction.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController extends BaseCrudController<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected entityName: string;

  constructor(protected readonly service: UsersService) {
    super(service);
  }

  @Post()
  @UseGuards(JwtAuthGuard, DomainRestrictionGuard)
  @ApiOperation({ summary: 'Создать пользователя' })
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    return this.service.createUser(dto);
  }
}
