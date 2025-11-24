import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { KnowlageBaseService } from './knowlage_base.service';
import { CreateKnowlageBaseDto } from './dto/create-knowlage_base.dto';
import { UpdateKnowlageBaseDto } from './dto/update-knowlage_base.dto';

@Controller('knowlage-base')
export class KnowlageBaseController {
  constructor(private readonly knowlageBaseService: KnowlageBaseService) {}

  @Post()
  create(@Body() createKnowlageBaseDto: CreateKnowlageBaseDto) {
    return this.knowlageBaseService.create(createKnowlageBaseDto);
  }

  @Get()
  findAll() {
    return this.knowlageBaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowlageBaseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKnowlageBaseDto: UpdateKnowlageBaseDto,
  ) {
    return this.knowlageBaseService.update(+id, updateKnowlageBaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowlageBaseService.remove(+id);
  }
}
