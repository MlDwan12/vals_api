import { Injectable } from '@nestjs/common';
import { Tariff } from './entities/tariff.entity';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudService } from 'src/core/crud/base.service';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { ServicesService } from '../services/services.service';
import { TariffsRepository } from './tariffs.repository';
import { Service } from '../services/entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TariffPeriodsService } from '../tariff_periods/tariff_periods.service';
import { BillingCycle } from 'src/shared/types/tariff/tariff.type';
import { TariffPeriod } from '../tariff_periods/entities/tariff_period.entity';

@Injectable()
export class TariffsService extends BaseCrudService<
  Tariff,
  CreateTariffDto,
  UpdateTariffDto
> {
  protected repository: BaseCrudRepository<Tariff>;
  constructor(
    @InjectRepository(Tariff)
    private readonly repo: Repository<Tariff>,
    protected readonly logger: PinoLogger,
    private readonly servicesService: ServicesService,
    private readonly tariffPeriodService: TariffPeriodsService,
  ) {
    super(logger);
    this.repository = new TariffsRepository(this.repo);
  }

  // async create(dto: CreateTariffDto): Promise<Tariff> {
  //   const { serviceId, periodsIds, ...rest } = dto;

  //   const result: BillingCycle[] = [];

  //   const existingPeriods = await this.tariffPeriodService.findAll();

  //   const service: Service = await this.servicesService.findOneOrFail({
  //     where: { id: serviceId },
  //   });

  //   const tariffPeriods: TariffPeriod[] = periodsIds?.length
  //     ? await this.tariffPeriodService.findByIds(periodsIds)
  //     : [];

  //   const selectedPeriodIds = new Set(tariffPeriods.map((p) => p.id));

  //   for (const period of existingPeriods) {
  //     const isSelected = selectedPeriodIds.has(period.id);

  //     if (isSelected) {
  //       const pricePerMonth =
  //         period.months === 1
  //           ? rest.basePrice
  //           : rest.basePrice * (1 - period.discountPercent / 100);

  //       result.push({
  //         periodId: period.id,
  //         monthCount: period.months,
  //         pricePerMonth,
  //         discountPercent: period.discountPercent,
  //         totalPrice: pricePerMonth * period.months,
  //       });
  //     } else {
  //       result.push({
  //         periodId: period.id,
  //         monthCount: period.months,
  //         pricePerMonth: rest.basePrice,
  //         discountPercent: null,
  //         totalPrice: rest.basePrice * period.months,
  //       });
  //     }
  //   }

  //   const entity = await this.repository.create({
  //     ...rest,
  //     billingCycles: result,
  //     service,
  //   });
  //   return entity;
  // }
  async create(dto: CreateTariffDto): Promise<Tariff> {
    const { serviceId, periodsIds, ...rest } = dto;

    const service: Service = await this.servicesService.findOneOrFail({
      where: { id: serviceId },
    });

    const result: BillingCycle[] = [];

    // если передали конкретные периоды
    if (periodsIds?.length) {
      const tariffPeriods =
        await this.tariffPeriodService.findByIds(periodsIds);

      for (const period of tariffPeriods) {
        const pricePerMonth =
          period.months === 1
            ? rest.basePrice
            : rest.basePrice * (1 - period.discountPercent / 100);

        result.push({
          periodId: period.id,
          monthCount: period.months,
          pricePerMonth,
          discountPercent: period.discountPercent,
          totalPrice: pricePerMonth * period.months,
        });
      }
    } else {
      const monthPeriod = await this.tariffPeriodService.findById(1);

      result.push({
        periodId: monthPeriod.id,
        monthCount: monthPeriod.months,
        pricePerMonth: rest.basePrice,
        discountPercent: null,
        totalPrice: rest.basePrice,
      });
    }

    const entity = await this.repository.create({
      ...rest,
      billingCycles: result,
      service,
    });

    return entity;
  }
}
