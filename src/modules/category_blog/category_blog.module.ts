import { Module } from '@nestjs/common';
import { CategoryBlogService } from './category_blog.service';
import { CategoryBlogController } from './category_blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryBlog } from './entities/category_blog.entity';
import { SubCategoryBlog } from '../subcategory_blog/entities/subcategory_blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryBlog, SubCategoryBlog])],
  controllers: [CategoryBlogController],
  providers: [CategoryBlogService],
})
export class CategoryBlogModule {}
