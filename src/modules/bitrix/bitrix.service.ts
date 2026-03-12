import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBitrixDto } from './dto/create-bitrix.dto';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { TariffsService } from '../tariffs/tariffs.service';
import { TariffPeriodsService } from '../tariff_periods/tariff_periods.service';
import { ServicesService } from '../services/services.service';
import { ClientLeadService } from '../client/services/client-lead.service';

@Injectable()
export class BitrixService {
  constructor(
    private readonly config: ConfigService,
    private readonly tariffService: TariffsService,
    private readonly tariffPeriodsService: TariffPeriodsService,
    private readonly servicesService: ServicesService,
    private readonly clientLeadService: ClientLeadService,
  ) {}

  async create(createBitrixDto: CreateBitrixDto): Promise<void> {
    const payload: Record<string, unknown> =
      await this.mapLeadToBitrixPayload(createBitrixDto);

    const webhook: string | undefined =
      this.config.get<string>('bitrix.webhook');

    if (!webhook) {
      throw new InternalServerErrorException(
        'Bitrix webhook is not configured',
      );
    }

    if (createBitrixDto.utm) {
      const utm: Record<string, string> | undefined = this.parseUtmForBitrix(
        createBitrixDto.utm,
      );

      if (utm) {
        Object.assign(payload, utm);
      }
    }

    let bitrixResponse: Record<string, unknown> | undefined;

    try {
      const response: AxiosResponse<Record<string, unknown>> = await axios.post(
        `${webhook}/crm.lead.add`,
        { fields: payload },
        { timeout: 10_000 },
      );

      bitrixResponse = response.data;
    } catch (error: unknown) {
      throw new InternalServerErrorException('Ошибка интеграции с Bitrix');
    }

    await this.clientLeadService.registerLead(
      createBitrixDto,
      payload,
      bitrixResponse,
    );
  }

  private parseUtmForBitrix(
    rawUtm?: string,
  ): Record<string, string> | undefined {
    if (!rawUtm) {
      return undefined;
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
        return undefined;
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

      return Object.keys(result).length > 0 ? result : undefined;
    } catch {
      return undefined;
    }
  }

  private async mapLeadToBitrixPayload(
    lead: CreateBitrixDto,
  ): Promise<Record<string, unknown>> {
    const commonFields: Record<string, unknown> = {
      NAME: lead.name,
      PHONE: lead.phone ? [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }] : [],
      EMAIL: lead.email ? [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }] : [],
      COMMENTS: lead.message || lead.comment || '',
      UF_CRM_CREATED_BY_API: true,
      SOURCE_ID: 'WEB',
    };

    switch (lead.type) {
      case 'FREE_CONSULTATION':
        return {
          TITLE: 'Новая консультация с сайта',
          ...commonFields,
        };

      case 'PARTNER':
        return {
          TITLE: 'Новая заявка от партнера с сайта',
          ...commonFields,
        };

      case 'ADD_QUESTION':
        return {
          TITLE: 'Клиент задал вопрос с сайта',
          ...commonFields,
        };

      case 'FREE_AUDIT':
        return {
          TITLE: 'Новый аудит с сайта',
          ...commonFields,
        };

      case 'TARIFF_REQUEST': {
        const tariff = await this.tariffService.findOneOrFail({
          where: { id: lead.tariffId },
          relations: { service: true },
        });

        const period = await this.tariffPeriodsService.findById(lead.periodId!);

        const service = await this.servicesService.findOneOrFail({
          where: { id: tariff.service.id },
        });

        const cycle = tariff.billingCycles.find(
          (item) => item.periodId === period.id,
        );

        if (!cycle) {
          throw new InternalServerErrorException('Period not found');
        }

        if (cycle.pricePerMonth === null) {
          throw new InternalServerErrorException(
            'Billing cycle pricePerMonth is not configured',
          );
        }

        const { COMMENTS, ...otherInfo } = commonFields;

        return {
          TITLE: `Выбрана услуга - ${service.title}`,
          COMMENTS: `Выбрана услуга - ${service.title} по тарифу: ${tariff.name} на период ${period.months} месяцев. Цена за месяц - ${cycle.pricePerMonth} руб. Общая стоимость: ${cycle.totalPrice} руб.`,
          ...otherInfo,
          UF_TARIFF_NAME: lead.tariffId,
          UF_TARIFF_PRICE: lead.periodId,
        };
      }

      default:
        throw new InternalServerErrorException(
          `Unsupported lead type: ${lead.type}`,
        );
    }
  }
}
