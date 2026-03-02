import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { BackgroundColor } from 'src/shared/enums/backgroundColor.enum';

export class CreateServiceDto {
  @ApiProperty({
    example: 'website-development',
    description: 'Уникальный slug услуги',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'ID категорий услуги',
    type: [Number],
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    example: 'Разработка сайтов',
    description: 'Заголовок услуги',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Создаем современные веб-решения',
    description: 'Подзаголовок услуги',
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    example: 'Полное описание услуги разработки сайтов...',
    description: 'Полное описание услуги',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  subDescription: string;

  @ApiPropertyOptional({
    example: ['Индивидуальный дизайн', 'Адаптивная верстка', 'SEO оптимизация'],
    description: 'Короткий список преимуществ (3 пункта)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  list?: string[];

  @ApiProperty({
    example: 'website-icon.svg',
    description: 'Иконка услуги',
  })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsOptional()
  @IsEnum(BackgroundColor)
  backgroundColor?: BackgroundColor;
}
