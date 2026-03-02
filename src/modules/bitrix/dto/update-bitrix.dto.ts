import { PartialType } from '@nestjs/mapped-types';
import { CreateBitrixDto } from './create-bitrix.dto';

export class UpdateBitrixDto extends PartialType(CreateBitrixDto) {}
