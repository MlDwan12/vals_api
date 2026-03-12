import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { BaseCrudController } from 'src/core/crud/base.controller';

@Controller('client')
export class ClientController extends BaseCrudController<
  Client,
  CreateClientDto,
  UpdateClientDto
> {
  protected entityName: string;

  constructor(protected readonly service: ClientService) {
    super(service);
  }
}
