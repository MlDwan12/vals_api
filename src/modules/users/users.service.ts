import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseCrudService } from 'src/core/crud/base.service';
import { PinoLogger } from 'nestjs-pino';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected repository: BaseCrudRepository<User>;
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new UserRepository(this.repo);
  }
}
