import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends BaseCrudRepository<User> {
  constructor(
    @InjectRepository(User)
    repo: Repository<User>,
  ) {
    super(repo, User);
  }
}
