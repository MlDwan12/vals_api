import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateServiceStepDto {
  @ApiProperty({ example: 1, description: 'Номер шага' })
  @IsInt()
  step: number;

  @ApiProperty({ example: 'Пример шага', description: 'Заголовок шага' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Описание шага', description: 'Описание шага' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: '1-2 дня',
    description: 'Примерное время выполнения',
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ example: 1, description: 'ID услуги, к которой привязан шаг' })
  @IsInt()
  serviceId: number;
}
