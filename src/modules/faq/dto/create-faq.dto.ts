import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({
    example: 1,
    description: 'ID услуги, к которой относится FAQ',
  })
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: 'Как работает услуга?',
    description: 'Вопрос FAQ',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'Услуга работает следующим образом...',
    description: 'Ответ FAQ',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
