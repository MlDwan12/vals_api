import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LeadType } from 'src/shared/enums/lead-type.enum';

export class CreateBitrixDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(32)
  phone: string;

  @IsEnum(LeadType)
  type: LeadType;

  @ValidateIf(
    (o: CreateBitrixDto) =>
      o.type === LeadType.FREE_CONSULTATION || o.type === LeadType.FREE_AUDIT,
  )
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @ValidateIf((o: CreateBitrixDto) => o.type === LeadType.TARIFF_REQUEST)
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ValidateIf((o: CreateBitrixDto) => o.type === LeadType.TARIFF_REQUEST)
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ValidateIf((o: CreateBitrixDto) => o.type === LeadType.TARIFF_REQUEST)
  @Type(() => Number)
  @IsNumber()
  tariffId?: number;

  @ValidateIf((o: CreateBitrixDto) => o.type === LeadType.TARIFF_REQUEST)
  @Type(() => Number)
  @IsNumber()
  periodId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  utm?: string;
}
