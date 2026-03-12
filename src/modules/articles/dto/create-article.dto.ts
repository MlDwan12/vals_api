import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
} from 'class-validator';

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
  keywords?: string;
}
