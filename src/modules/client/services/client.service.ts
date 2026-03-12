import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client } from '../entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { BaseCrudService } from 'src/core/crud/base.service';
import { Repository } from 'typeorm';
import { ClientRepository } from '../client.repository';

@Injectable()
export class ClientService extends BaseCrudService<
  Client,
  CreateClientDto,
  UpdateClientDto
> {
  protected repository: BaseCrudRepository<Client>;
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ClientRepository(this.repo);
  }
}
