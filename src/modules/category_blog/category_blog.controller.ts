import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryBlogService } from './category_blog.service';
import { CreateCategoryBlogDto } from './dto/create-category_blog.dto';
import { UpdateCategoryBlogDto } from './dto/update-category_blog.dto';

@Controller('category-blog')
export class CategoryBlogController {
  constructor(private readonly categoryBlogService: CategoryBlogService) {}

  @Post()
  create(@Body() createCategoryBlogDto: CreateCategoryBlogDto) {
    return this.categoryBlogService.create(createCategoryBlogDto);
  }

  @Get()
  findAll() {
    return this.categoryBlogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryBlogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryBlogDto: UpdateCategoryBlogDto,
  ) {
    return this.categoryBlogService.update(+id, updateCategoryBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryBlogService.remove(+id);
  }
}
