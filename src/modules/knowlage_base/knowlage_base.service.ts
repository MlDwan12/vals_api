import { Injectable } from '@nestjs/common';
import { CreateKnowlageBaseDto } from './dto/create-knowlage_base.dto';
import { UpdateKnowlageBaseDto } from './dto/update-knowlage_base.dto';

@Injectable()
export class KnowlageBaseService {
  create(createKnowlageBaseDto: CreateKnowlageBaseDto) {
    return 'This action adds a new knowlageBase';
  }

  findAll() {
    return `This action returns all knowlageBase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} knowlageBase`;
  }

  update(id: number, updateKnowlageBaseDto: UpdateKnowlageBaseDto) {
    return `This action updates a #${id} knowlageBase`;
  }

  remove(id: number) {
    return `This action removes a #${id} knowlageBase`;
  }
}
