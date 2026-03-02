import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreateTariffDto {
  @ApiProperty({
    example: 1,
    description: 'ID услуги, к которой привязан тариф',
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: 'Базовый',
    description: 'Название тарифа',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Для малого и среднего бизнеса',
    description: 'Для кого предназначен тариф',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    example:
      'Мониторинг упоминаний - систематический сбор и анализ упоминаний бренда в цифровом пространстве||Размещение отзывов - создание и публикация положительных отзывов на релевантных платформах',
    description: 'Ключевые особенности тарифа (через ||)',
  })
  @IsString()
  @IsNotEmpty()
  features: string;

  @ApiProperty({
    example: 'true',
    description: 'Является ли тариф популярным (для выделения на сайте)',
  })
  @IsBoolean()
  @IsOptional()
  is_popular?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Порядок сортировки тарифа',
  })
  @IsInt()
  @IsOptional()
  order_index?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Базовая цена тарифа в рублях',
  })
  @IsInt()
  basePrice: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'ID периодов, связанных с тарифом',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  periodsIds: number[];
}
