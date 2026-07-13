import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'ORM',
    description: 'Название тега — slug генерируется автоматически на бэке',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
