import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryBlogDto } from './create-category_blog.dto';

export class UpdateCategoryBlogDto extends PartialType(CreateCategoryBlogDto) {}
