import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubcategoryBlogService } from './subcategory_blog.service';
import { CreateSubcategoryBlogDto } from './dto/create-subcategory_blog.dto';
import { UpdateSubcategoryBlogDto } from './dto/update-subcategory_blog.dto';

@Controller('subcategory-blog')
export class SubcategoryBlogController {
  constructor(
    private readonly subcategoryBlogService: SubcategoryBlogService,
  ) {}

  @Post()
  create(@Body() createSubcategoryBlogDto: CreateSubcategoryBlogDto) {
    return this.subcategoryBlogService.create(createSubcategoryBlogDto);
  }

  @Get()
  findAll() {
    return this.subcategoryBlogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoryBlogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryBlogDto: UpdateSubcategoryBlogDto,
  ) {
    return this.subcategoryBlogService.update(+id, updateSubcategoryBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoryBlogService.remove(+id);
  }
}
