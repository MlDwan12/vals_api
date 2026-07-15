import { ApiProperty } from '@nestjs/swagger';

/** Минимальная проекция статьи/кейса для sitemap.xml и человекочитаемой карты сайта — без пагинации. */
export class ContentSitemapItemDto {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  updatedAt!: Date;
}
