import { ApiProperty } from '@nestjs/swagger';
import { TagShortDto } from './tag-short.dto';

/** Проекция тега для админ-таблицы — с количеством привязанных статей/кейсов. */
export class TagWithCountsDto extends TagShortDto {
  @ApiProperty()
  articlesCount!: number;

  @ApiProperty()
  casesCount!: number;
}
