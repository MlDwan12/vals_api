import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBitrixDto } from './dto/create-bitrix.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TariffsService } from '../tariffs/tariffs.service';
import { TariffPeriodsService } from '../tariff_periods/tariff_periods.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class BitrixService {
  constructor(
    private config: ConfigService,
    private readonly tariffService: TariffsService,
    private readonly tariffPeriodsService: TariffPeriodsService,
    private readonly servicesService: ServicesService,
  ) {}

  async create(createBitrixDto: CreateBitrixDto) {
    const payload = await this.mapLeadToBitrixPayload(createBitrixDto);
    const webhook: string = this.config.get('bitrix.webhook')!;
    let utm;

    if (createBitrixDto.utm) {
      const ALLOWED_UTM_FIELDS = [
        'UTM_MEDIUM',
        'UTM_CAMPAIGN',
        'UTM_CONTENT',
        'UTM_TERM',
        'UTM_SOURCE',
      ] as const;

      type UtmKey = (typeof ALLOWED_UTM_FIELDS)[number];

      type UtmPayload = Partial<Record<UtmKey, string>>;

      function parseUtm(rawUtm?: string): UtmPayload | undefined {
        if (!rawUtm) return;

        try {
          const parsed = JSON.parse(rawUtm);

          if (typeof parsed !== 'object' || parsed === null) {
            return;
          }

          const utm: UtmPayload = {};

          for (const key of ALLOWED_UTM_FIELDS) {
            const value = parsed[key] ?? parsed[key.toLowerCase()];

            if (typeof value === 'string' && value.trim() !== '') {
              utm[key] = value;
            }
          }

          return Object.keys(utm).length ? utm : undefined;
        } catch {
          return;
        }
      }
      utm = parseUtm(createBitrixDto.utm);
    }
    try {
      try {
        if (createBitrixDto.utm && payload) Object.assign(payload, utm);

        await axios.post(
          `${webhook}/crm.lead.add`,
          { fields: payload },
          { timeout: 10_000 },
        );
      } catch (err) {
        console.error('[BITRIX] error:', err);
        throw new InternalServerErrorException('Ошибка интеграции с Bitrix');
      }
    } catch (err) {
      console.error('Ошибка при отправке лида в Bitrix', err);
      throw err;
    }
  }

  private async mapLeadToBitrixPayload(lead: CreateBitrixDto) {
    const commonFields = {
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
          // UF_IS_TASK_DEFINED: lead.isTaskDefined ? 'Да' : 'Нет',
        };

      case 'TARIFF_REQUEST':
        const tariff = await this.tariffService.findOneOrFail({
          where: { id: lead.tariffId },
          relations: { service: true },
        });

        const period = await this.tariffPeriodsService.findById(lead.periodId!);

        const service = await this.servicesService.findOneOrFail({
          where: { id: tariff.service.id },
        });

        const cycle = tariff.billingCycles.find(
          (c) => c.periodId === period.id,
        );

        if (!cycle) {
          throw new Error('Period not found');
        }

        const { COMMENTS, ...otherInfo } = commonFields;
        return {
          TITLE: `Выбрана услуга  -${service.title}`,
          COMMENTS: `Выбрана услуга  -${service.title} по тарифу: ${tariff.name} на период ${period.months} месяцев. Цена за месяц - ${cycle.pricePerMonth} руб. Общая стоимость: ${cycle.totalPrice} руб. `,
          ...otherInfo,
          UF_TARIFF_NAME: lead.tariffId,
          UF_TARIFF_PRICE: lead.periodId,
        };
    }
  }
}
