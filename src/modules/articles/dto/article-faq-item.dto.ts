import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ArticleFaqItemDto {
  @ApiProperty({
    example: 'ORM — это простыми словами что?',
    description: 'Вопрос FAQ статьи',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'ORM — это управление тем, как компания выглядит в интернете...',
    description: 'Ответ FAQ статьи',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
