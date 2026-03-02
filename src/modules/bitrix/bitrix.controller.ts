import { Controller, Post, Body } from '@nestjs/common';
import { BitrixService } from './bitrix.service';
import { CreateBitrixDto } from './dto/create-bitrix.dto';

@Controller('bitrix')
export class BitrixController {
  constructor(private readonly bitrixService: BitrixService) {}

  @Post()
  create(@Body() createBitrixDto: CreateBitrixDto) {
    return this.bitrixService.create(createBitrixDto);
  }
}
