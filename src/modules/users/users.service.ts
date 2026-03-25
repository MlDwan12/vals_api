import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
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
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService extends BaseCrudService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  protected repository: UserRepository;
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(PinoLogger)
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = userRepository;
  }

  // async createUser(dto: CreateUserDto): Promise<void> {
  //   const normalizedName = dto.username.trim();

  //   const existingUser = await this.repo.findOne({
  //     where: { username: normalizedName },
  //     select: {
  //       id: true,
  //       username: true,
  //     } as never,
  //   });

  //   if (existingUser) {
  //     throw new ConflictException('Пользователь с таким именем уже существует');
  //   }

  //   let passwordHash: string;

  //   try {
  //     passwordHash = await bcrypt.hash(dto.password, 10);
  //   } catch (error: unknown) {
  //     this.logger.error(
  //       {
  //         err: error,
  //         username: normalizedName,
  //       },
  //       'Failed to hash user password',
  //     );

  //     throw new InternalServerErrorException(
  //       'Не удалось обработать пароль пользователя',
  //     );
  //   }
  //   const userToCreate = this.repo.create({
  //     username: normalizedName,
  //     password: passwordHash,
  //   });

  //   await this.repo.save(userToCreate);
  // }

  async createUser(dto: CreateUserDto): Promise<void> {
    await this.createWithRole(dto.username, dto.password, UserRole.USER);
  }

  async findForAuth(username: string): Promise<User | null> {
    const normalizedUsername = username.trim();

    console.log('userRepository ctor:', this.userRepository?.constructor?.name);
    console.log(
      'userRepository proto methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(this.userRepository)),
    );

    return this.userRepository.findByUsernameForAuth(normalizedUsername);
  }

  async createModerator(dto: CreateUserDto): Promise<void> {
    await this.createWithRole(dto.username, dto.password, UserRole.MODERATOR);
  }

  private async createWithRole(
    username: string,
    password: string,
    role: UserRole,
  ): Promise<void> {
    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { username: normalizedUsername },
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
      passwordHash = await bcrypt.hash(password, 12);
    } catch (error: unknown) {
      this.logger.error(
        {
          err: error,
          username: normalizedUsername,
          role,
        },
        'Failed to hash user password',
      );

      throw new InternalServerErrorException(
        'Не удалось обработать пароль пользователя',
      );
    }
    try {
      await this.userRepository.create({
        username: normalizedUsername,
        password: passwordHash,
        role,
      });
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Пользователь с таким именем уже существует',
        );
      }

      this.logger.error(
        {
          err: error,
          username: normalizedUsername,
          role,
        },
        'Failed to save user',
      );

      throw new InternalServerErrorException('Не удалось создать пользователя');
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === 'string' &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === '23505'
    );
  }
}
