import { PartialType } from '@nestjs/mapped-types';
import { CreateTariffPeriodDto } from './create-tariff_period.dto';

export class UpdateTariffPeriodDto extends PartialType(CreateTariffPeriodDto) {}
