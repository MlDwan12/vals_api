import { ApiProperty } from '@nestjs/swagger';

/** Лёгкая проекция тега — джойн к статьям/кейсам и публичный список для фильтра. */
export class TagShortDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
}
