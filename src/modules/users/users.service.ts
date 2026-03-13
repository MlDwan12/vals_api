import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseCrudService } from 'src/core/crud/base.service';
import { PinoLogger } from 'nestjs-pino';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

  async createUser(dto: CreateUserDto): Promise<void> {
    const normalizedName = dto.username.trim();

    const existingUser = await this.repo.findOne({
      where: { username: normalizedName },
      select: {
        id: true,
        username: true,
      } as never,
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    let passwordHash: string;

    try {
      passwordHash = await bcrypt.hash(dto.password, 10);
    } catch (error: unknown) {
      this.logger.error(
        {
          err: error,
          username: normalizedName,
        },
        'Failed to hash user password',
      );

      throw new InternalServerErrorException(
        'Не удалось обработать пароль пользователя',
      );
    }
    const userToCreate = this.repo.create({
      username: normalizedName,
      password: passwordHash,
    });

    await this.repo.save(userToCreate);
  }
}
