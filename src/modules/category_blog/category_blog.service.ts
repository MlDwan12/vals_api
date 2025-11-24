import { Injectable } from '@nestjs/common';
import { CreateCategoryBlogDto } from './dto/create-category_blog.dto';
import { UpdateCategoryBlogDto } from './dto/update-category_blog.dto';

@Injectable()
export class CategoryBlogService {
  create(createCategoryBlogDto: CreateCategoryBlogDto) {
    return 'This action adds a new categoryBlog';
  }

  findAll() {
    return `This action returns all categoryBlog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryBlog`;
  }

  update(id: number, updateCategoryBlogDto: UpdateCategoryBlogDto) {
    return `This action updates a #${id} categoryBlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryBlog`;
  }
}
