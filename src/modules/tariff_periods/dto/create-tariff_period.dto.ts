import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateTariffPeriodDto {
  @ApiProperty({
    example: 12,
    description: 'Количество месяцев периода',
  })
  @IsInt()
  @Min(1)
  months: number;

  @ApiProperty({
    example: 1000,
    description: 'Базовая цена за период',
  })
  @IsInt()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Процент скидки (опционально)',
  })
  @IsInt()
  @IsOptional()
  discountPercent?: number;
}
