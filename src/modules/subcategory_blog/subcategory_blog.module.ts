import { Module } from '@nestjs/common';
import { SubcategoryBlogService } from './subcategory_blog.service';
import { SubcategoryBlogController } from './subcategory_blog.controller';

@Module({
  controllers: [SubcategoryBlogController],
  providers: [SubcategoryBlogService],
})
export class SubcategoryBlogModule {}
