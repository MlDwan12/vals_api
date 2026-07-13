import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CaseFaqItemDto {
  @ApiProperty({
    example: 'Сколько занимает работа над кейсом?',
    description: 'Вопрос FAQ кейса',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'В среднем работа занимает 2-3 месяца...',
    description: 'Ответ FAQ кейса',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
