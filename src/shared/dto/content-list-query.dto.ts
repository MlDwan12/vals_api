import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AdminListQueryDto } from './admin-list-query.dto';

/** AdminListQueryDto + фильтр по slug автора — статьи и кейсы (список привязан к сотруднику). */
export class ContentListQueryDto extends AdminListQueryDto {
  @ApiPropertyOptional({ description: 'Показать только материалы этого автора (slug сотрудника)' })
  @IsOptional()
  @IsString()
  authorSlug?: string;
}
