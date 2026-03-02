import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceCategoryDto {
  @ApiProperty({
    example: 'Веб-разработка',
    description: 'Название категории',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Категория услуг по разработке сайтов и веб-приложений',
    description: 'Описание категории',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
