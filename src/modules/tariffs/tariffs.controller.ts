import { Controller } from '@nestjs/common';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { Tariff } from './entities/tariff.entity';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { TariffsService } from './tariffs.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Тарифы')
@Controller('tariffs')
export class TariffsController extends BaseCrudController<
  Tariff,
  CreateTariffDto,
  UpdateTariffDto
> {
  protected entityName: string;

  constructor(protected readonly service: TariffsService) {
    super(service);
  }
}
