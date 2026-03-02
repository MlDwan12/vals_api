import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { LeadType } from 'src/shared/enums/lead-type.enum';

export class CreateBitrixDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(LeadType)
  type: LeadType;

  @ValidateIf(
    (o) =>
      o.type === LeadType.FREE_CONSULTATION || o.type === LeadType.FREE_AUDIT,
  )
  @IsOptional()
  @IsString()
  message?: string;

  // @ValidateIf((o) => o.type === LeadType.FREE_AUDIT)
  // @IsBoolean()
  // isTaskDefined?: boolean;

  @ValidateIf((o) => o.type === LeadType.TARIFF_REQUEST)
  @IsOptional()
  @IsString()
  email?: string;

  @ValidateIf((o) => o.type === LeadType.TARIFF_REQUEST)
  @IsOptional()
  @IsString()
  comment?: string;

  @ValidateIf((o) => o.type === LeadType.TARIFF_REQUEST)
  @IsNumber()
  tariffId?: number;

  @ValidateIf((o) => o.type === LeadType.TARIFF_REQUEST)
  @IsNumber()
  periodId?: number;

  @IsOptional()
  @IsString()
  utm?: string;
}
