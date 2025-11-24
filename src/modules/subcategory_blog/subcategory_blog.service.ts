import { Injectable } from '@nestjs/common';
import { CreateSubcategoryBlogDto } from './dto/create-subcategory_blog.dto';
import { UpdateSubcategoryBlogDto } from './dto/update-subcategory_blog.dto';

@Injectable()
export class SubcategoryBlogService {
  create(createSubcategoryBlogDto: CreateSubcategoryBlogDto) {
    return 'This action adds a new subcategoryBlog';
  }

  findAll() {
    return `This action returns all subcategoryBlog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subcategoryBlog`;
  }

  update(id: number, updateSubcategoryBlogDto: UpdateSubcategoryBlogDto) {
    return `This action updates a #${id} subcategoryBlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} subcategoryBlog`;
  }
}
