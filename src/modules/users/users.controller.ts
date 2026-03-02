import { Controller } from '@nestjs/common';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

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
}
