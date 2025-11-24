import { PartialType } from '@nestjs/mapped-types';
import { CreateKnowlageBaseDto } from './create-knowlage_base.dto';

export class UpdateKnowlageBaseDto extends PartialType(CreateKnowlageBaseDto) {}
