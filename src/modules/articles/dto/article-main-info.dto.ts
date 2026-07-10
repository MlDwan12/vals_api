import { ApiProperty } from '@nestjs/swagger';
import { EmployeeShortDto } from 'src/modules/employees/dto/employee-short.dto';

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [EmployeeShortDto] })
  authors!: EmployeeShortDto[];
}
