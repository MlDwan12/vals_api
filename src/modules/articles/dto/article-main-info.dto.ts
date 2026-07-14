import { ApiProperty } from '@nestjs/swagger';
import { EmployeeShortDto } from 'src/modules/employees/dto/employee-short.dto';
import { TagShortDto } from 'src/modules/tags/dto/tag-short.dto';

export class ArticleMainInfoDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  datePublished!: Date | null;

  @ApiProperty()
  priority!: number;

  @ApiProperty({ nullable: true })
  readingTime!: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [EmployeeShortDto] })
  authors!: EmployeeShortDto[];

  @ApiProperty({ type: [TagShortDto] })
  tags!: TagShortDto[];
}
