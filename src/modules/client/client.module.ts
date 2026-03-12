import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { ClientController } from './controllers/client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientContactEntity } from './entities/client-contact.entity';
import { ClientLeadEntity } from './entities/client-lead.entity';
import { ClientLeadService } from './services/client-lead.service';
import { ClientContactService } from './services/client-contact.service';
import { ClientLeadAdminService } from './services/client-lead-admin.service';
import { ClientRepository } from './client.repository';
import { ClientContactAdminController } from './controllers/client-contact-admin.controller';
import { ClientLeadAdminController } from './controllers/client-lead-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientContactEntity, ClientLeadEntity, Client]),
  ],
  controllers: [
    ClientController,
    ClientContactAdminController,
    ClientLeadAdminController,
  ],
  providers: [
    ClientService,
    ClientLeadService,
    ClientLeadAdminService,
    ClientContactService,
    ClientRepository,
  ],
  exports: [
    ClientLeadService,
    ClientService,
    ClientContactService,
    ClientLeadAdminService,
  ],
})
export class ClientModule {}
