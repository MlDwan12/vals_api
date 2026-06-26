import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Alt-тексты для каждого файла (по порядку). Длина массива не должна превышать количество файлов.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((item) => (typeof item === 'string' ? item.trim() : item));
  })
  @IsArray()
  @IsString({ each: true })
  alt?: string[];
}
