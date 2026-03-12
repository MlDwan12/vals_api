import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientRepository extends BaseCrudRepository<Client> {
  constructor(
    @InjectRepository(Client)
    repo: Repository<Client>,
  ) {
    super(repo, Client);
  }
}
