import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'ORM',
    description: 'Название тега — slug генерируется автоматически на бэке',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 0,
    description:
      'Приоритет — порядок тега в списках/фильтре на сайте (чем выше — тем выше в списке). На сортировку статей/кейсов не влияет.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
