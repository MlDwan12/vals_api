import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateArticleFaqDto {
  @ApiProperty({
    example: 1,
    description: 'ID статьи, к которой относится FAQ',
  })
  @IsInt()
  articleId: number;

  @ApiProperty({
    example: 'ORM — это простыми словами что?',
    description: 'Вопрос FAQ',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'ORM — это управление тем, как компания выглядит в интернете...',
    description: 'Ответ FAQ',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
