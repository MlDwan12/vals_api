import { ApiProperty } from '@nestjs/swagger';

/** Лёгкая проекция сотрудника — подпись автора под статьёй/кейсом и карточка на «О компании». */
export class EmployeeShortDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  photoUrl!: string | null;

  @ApiProperty()
  position!: string;

  @ApiProperty({ nullable: true })
  experience!: string | null;
}
