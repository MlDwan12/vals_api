import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateCaseFaqDto {
  @ApiProperty({
    example: 1,
    description: 'ID кейса, к которому относится FAQ',
  })
  @IsInt()
  caseId: number;

  @ApiProperty({
    example: 'Сколько занимает работа над кейсом?',
    description: 'Вопрос FAQ',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'В среднем работа занимает 2-3 месяца...',
    description: 'Ответ FAQ',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
