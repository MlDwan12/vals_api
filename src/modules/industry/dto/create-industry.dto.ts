import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({
    example: 'IT',
    description: 'Название отрасли (уникальное)',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
