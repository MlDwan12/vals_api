import { PartialType } from '@nestjs/mapped-types';
import { CreateImageLibDto } from './create-image-lib.dto';

export class UpdateImageLibDto extends PartialType(CreateImageLibDto) {}
