import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateBitrixDto } from 'src/modules/bitrix/dto/create-bitrix.dto';
import { Client } from '../entities/client.entity';
import { normalizePhone } from '../utils/normalize-phone.util';
import { normalizeEmail } from '../utils/normalize-email.util';
import { ClientLeadEntity } from '../entities/client-lead.entity';
import { ClientContactEntity } from '../entities/client-contact.entity';
import { ClientContactType } from 'src/shared/enums/contact.enum';

interface ResolveClientResult {
  client: Client;
  normalizedPhone: string | null;
  normalizedEmail: string | null;
}

@Injectable()
export class ClientLeadService {
  constructor(private readonly dataSource: DataSource) {}

  async registerLead(
    dto: CreateBitrixDto,
    bitrixPayload: Record<string, unknown>,
    bitrixResponse?: Record<string, unknown>,
  ): Promise<ClientLeadEntity> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const resolved: ResolveClientResult = await this.resolveClient(
        manager,
        dto,
      );

      await this.attachContacts(
        manager,
        resolved.client.id,
        resolved.normalizedPhone,
        resolved.normalizedEmail,
      );

      const leadRepository: Repository<ClientLeadEntity> =
        manager.getRepository(ClientLeadEntity);

      const lead: ClientLeadEntity = leadRepository.create({
        clientId: resolved.client.id,
        externalSystem: 'BITRIX',
        type: dto.type,
        name: dto.name?.trim() ? dto.name.trim() : null,
        phoneRaw: dto.phone ?? null,
        phoneNormalized: resolved.normalizedPhone,
        emailRaw: dto.email ?? null,
        emailNormalized: resolved.normalizedEmail,
        message: dto.message ?? null,
        comment: dto.comment ?? null,
        utm: this.parseUtm(dto.utm),
        payload: this.buildRequestPayload(dto),
        bitrixPayload,
        bitrixResponse: bitrixResponse ?? null,
        bitrixLeadId: this.extractBitrixLeadId(bitrixResponse),
      });

      const savedLead: ClientLeadEntity = await leadRepository.save(lead);

      await manager
        .createQueryBuilder()
        .update(Client)
        .set({
          name: dto.name?.trim() ? dto.name.trim() : resolved.client.name,
          primaryPhone:
            resolved.normalizedPhone ?? resolved.client.primaryPhone,
          primaryEmail:
            resolved.normalizedEmail ?? resolved.client.primaryEmail,
          lastLeadAt: new Date(),
          leadsCount: () => '"leads_count" + 1',
        })
        .where('id = :id', { id: resolved.client.id })
        .execute();

      return savedLead;
    });
  }

  private async resolveClient(
    manager: EntityManager,
    dto: CreateBitrixDto,
  ): Promise<ResolveClientResult> {
    const normalizedPhone: string | null = normalizePhone(dto.phone);
    const normalizedEmail: string | null = normalizeEmail(dto.email);

    const contactRepository: Repository<ClientContactEntity> =
      manager.getRepository(ClientContactEntity);
    const clientRepository: Repository<Client> = manager.getRepository(Client);

    const matchedClientIds: number[] = [];

    if (normalizedPhone) {
      const phoneContact: ClientContactEntity | null =
        await contactRepository.findOne({
          where: {
            type: ClientContactType.PHONE,
            value: normalizedPhone,
          },
        });

      if (phoneContact) {
        matchedClientIds.push(phoneContact.clientId);
      }
    }

    if (normalizedEmail) {
      const emailContact: ClientContactEntity | null =
        await contactRepository.findOne({
          where: {
            type: ClientContactType.EMAIL,
            value: normalizedEmail,
          },
        });

      if (emailContact) {
        matchedClientIds.push(emailContact.clientId);
      }
    }

    const uniqueClientIds: number[] = [...new Set(matchedClientIds)];

    if (uniqueClientIds.length === 0) {
      const createdClient: Client = clientRepository.create({
        name: dto.name?.trim() ? dto.name.trim() : null,
        primaryPhone: normalizedPhone,
        primaryEmail: normalizedEmail,
        leadsCount: 0,
        lastLeadAt: null,
        isMerged: false,
        mergedIntoClientId: null,
      });

      const savedClient: Client = await clientRepository.save(createdClient);

      return {
        client: savedClient,
        normalizedPhone,
        normalizedEmail,
      };
    }

    if (uniqueClientIds.length === 1) {
      const existingClient: Client | null = await clientRepository.findOne({
        where: { id: uniqueClientIds[0], isMerged: false },
      });

      if (!existingClient) {
        throw new InternalServerErrorException('Client not found');
      }

      return {
        client: existingClient,
        normalizedPhone,
        normalizedEmail,
      };
    }

    const clients: Client[] = await clientRepository.find({
      where: { id: In(uniqueClientIds), isMerged: false },
      order: { id: 'ASC' },
    });

    if (clients.length === 0) {
      throw new InternalServerErrorException('Matched clients not found');
    }

    const primaryClient: Client = clients[0];
    const duplicateClients: Client[] = clients.slice(1);

    await this.mergeClients(
      manager,
      primaryClient.id,
      duplicateClients.map((item: Client) => item.id),
    );

    const refreshedClient: Client | null = await clientRepository.findOne({
      where: { id: primaryClient.id, isMerged: false },
    });

    if (!refreshedClient) {
      throw new InternalServerErrorException(
        'Primary client not found after merge',
      );
    }

    return {
      client: refreshedClient,
      normalizedPhone,
      normalizedEmail,
    };
  }

  private async attachContacts(
    manager: EntityManager,
    clientId: number,
    normalizedPhone: string | null,
    normalizedEmail: string | null,
  ): Promise<void> {
    const contactRepository: Repository<ClientContactEntity> =
      manager.getRepository(ClientContactEntity);

    if (normalizedPhone) {
      await this.createContactIfMissing(
        contactRepository,
        clientId,
        ClientContactType.PHONE,
        normalizedPhone,
      );
    }

    if (normalizedEmail) {
      await this.createContactIfMissing(
        contactRepository,
        clientId,
        ClientContactType.EMAIL,
        normalizedEmail,
      );
    }
  }

  private async createContactIfMissing(
    repository: Repository<ClientContactEntity>,
    clientId: number,
    type: ClientContactType,
    value: string,
  ): Promise<void> {
    const existing: ClientContactEntity | null = await repository.findOne({
      where: { type, value },
    });

    if (!existing) {
      try {
        const created: ClientContactEntity = repository.create({
          clientId,
          type,
          value,
          isPrimary: true,
        });

        await repository.save(created);
        return;
      } catch (error: unknown) {
        const reloaded: ClientContactEntity | null = await repository.findOne({
          where: { type, value },
        });

        if (!reloaded) {
          throw error;
        }

        if (reloaded.clientId !== clientId) {
          throw new InternalServerErrorException(
            `Contact ${type}:${value} belongs to another client`,
          );
        }

        return;
      }
    }

    if (existing.clientId !== clientId) {
      throw new InternalServerErrorException(
        `Contact ${type}:${value} belongs to another client`,
      );
    }
  }

  private async mergeClients(
    manager: EntityManager,
    primaryClientId: number,
    duplicateClientIds: number[],
  ): Promise<void> {
    if (duplicateClientIds.length === 0) {
      return;
    }

    await manager
      .createQueryBuilder()
      .update(ClientContactEntity)
      .set({ clientId: primaryClientId })
      .where('client_id IN (:...duplicateClientIds)', { duplicateClientIds })
      .execute();

    await manager
      .createQueryBuilder()
      .update(ClientLeadEntity)
      .set({ clientId: primaryClientId })
      .where('client_id IN (:...duplicateClientIds)', { duplicateClientIds })
      .execute();

    const duplicates: Client[] = await manager.getRepository(Client).find({
      where: { id: In(duplicateClientIds) },
    });

    const additionalLeadsCount: number = duplicates.reduce(
      (accumulator: number, item: Client) => accumulator + item.leadsCount,
      0,
    );

    await manager
      .createQueryBuilder()
      .update(Client)
      .set({
        leadsCount: () => `"leads_count" + ${additionalLeadsCount}`,
      })
      .where('id = :id', { id: primaryClientId })
      .execute();

    await manager
      .createQueryBuilder()
      .update(Client)
      .set({
        isMerged: true,
        mergedIntoClientId: primaryClientId,
      })
      .where('id IN (:...duplicateClientIds)', { duplicateClientIds })
      .execute();
  }

  private parseUtm(rawUtm?: string): Record<string, string> | null {
    if (!rawUtm) {
      return null;
    }

    const allowedKeys = [
      'UTM_MEDIUM',
      'UTM_CAMPAIGN',
      'UTM_CONTENT',
      'UTM_TERM',
      'UTM_SOURCE',
    ] as const;

    try {
      const parsedUnknown: unknown = JSON.parse(rawUtm);

      if (typeof parsedUnknown !== 'object' || parsedUnknown === null) {
        return null;
      }

      const parsed: Record<string, unknown> = parsedUnknown as Record<
        string,
        unknown
      >;
      const result: Record<string, string> = {};

      for (const key of allowedKeys) {
        const upperValue: unknown = parsed[key];
        const lowerValue: unknown = parsed[key.toLowerCase()];
        const value: unknown = upperValue ?? lowerValue;

        if (typeof value === 'string' && value.trim() !== '') {
          result[key] = value.trim();
        }
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch {
      return null;
    }
  }

  private buildRequestPayload(dto: CreateBitrixDto): Record<string, unknown> {
    return {
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      type: dto.type,
      message: dto.message ?? null,
      comment: dto.comment ?? null,
      tariffId: dto.tariffId ?? null,
      periodId: dto.periodId ?? null,
    };
  }

  private extractBitrixLeadId(
    bitrixResponse?: Record<string, unknown>,
  ): string | null {
    if (!bitrixResponse) {
      return null;
    }

    const result: unknown = bitrixResponse.result;

    if (typeof result === 'string' || typeof result === 'number') {
      return String(result);
    }

    return null;
  }
}
