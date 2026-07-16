import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
  IsDateString,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { MaxKeywords } from 'src/common/validators/max-keywords.validator';

export class CreateArticleDto {
  @ApiProperty({
    example: 'kak-nachat-programmirovat',
    description: 'Slug статьи (уникальный URL)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: 'Как начать программировать',
    description: 'Заголовок статьи',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Краткое описание статьи для карточки',
    description: 'Описание статьи',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Основной контент статьи (JSON редактора, например TipTap)',
    example: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Текст статьи' }],
        },
      ],
    },
  })
  @IsObject()
  content: Record<string, any>;

  @IsOptional()
  contentHtml: string;

  @ApiProperty({
    example: 'Как начать программировать — руководство',
    description: 'SEO заголовок',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiProperty({
    example: 'Полное руководство для новичков в программировании',
    description: 'SEO описание',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({
    example: 'программирование, обучение, разработка',
    description: 'SEO ключевые слова',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxKeywords(5, {
    message: 'Можно указать не более 5 ключевых фраз',
  })
  keywords?: string;

  @ApiPropertyOptional({
    example: '2026-07-01T00:00:00.000Z',
    description:
      'Дата публикации. null — черновик, будущая дата — запланированная, прошедшая — опубликованная',
  })
  @IsOptional()
  @IsDateString()
  datePublished?: string | null;

  @ApiPropertyOptional({
    example: 0,
    description: 'Приоритет (чем выше — тем выше в списке)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Время чтения статьи в минутах — указывается вручную',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readingTime?: number | null;

  @ApiProperty({
    example: [1],
    description: 'ID авторов (сотрудников) статьи — минимум один',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  authorIds: number[];

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'ID тегов статьи (необязательно)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];
}
