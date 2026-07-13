import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 6;

/** Query для «похожих материалов» — ранжирование по совпадению tagIds текущей статьи/кейса. */
export class SimilarContentQueryDto {
  @ApiProperty({ example: '1,2,3', description: 'ID тегов текущего материала, через запятую' })
  @Transform(({ value }: { value: unknown }) =>
    String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .map(Number),
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds: number[];

  @ApiPropertyOptional({ description: 'ID текущего материала — исключить из выдачи' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  excludeId?: number;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === '' ? DEFAULT_LIMIT : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;
}
