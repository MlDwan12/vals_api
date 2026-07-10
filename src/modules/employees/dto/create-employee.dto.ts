import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  ArrayMaxSize,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'ivan-petrov',
    description: 'Slug сотрудника (уникальный URL /ob-avtore/:slug)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: 'Иван Петров',
    description: 'Полное имя (не инициалы — важно для доверия к автору)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'SERM-специалист',
    description: 'Должность',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position: string;

  @ApiPropertyOptional({ description: 'Фото — URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Короткое описание 1-2 предложения — карточка «О компании» + подпись под статьёй',
  })
  @IsOptional()
  @IsString()
  shortBio?: string;

  @ApiPropertyOptional({
    description: 'Полное био — JSON контент редактора (TipTap), для персональной страницы',
  })
  @IsOptional()
  @IsObject()
  bio?: Record<string, any>;

  @IsOptional()
  bioHtml?: string;

  @ApiPropertyOptional({
    example: '6 лет в digital-маркетинге',
    description: 'Стаж, свободная форма',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    example: ['https://t.me/ivanpetrov', 'https://vk.com/ivanpetrov'],
    description: 'Ссылки на внешние профили',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  sameAs?: string[];

  @ApiPropertyOptional({ description: 'SEO заголовок персональной страницы' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO описание персональной страницы' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 0, description: 'Порядок на странице «Команда»' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'Видимость на сайте (false — скрыт, но авторство в старых материалах сохраняется)',
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
