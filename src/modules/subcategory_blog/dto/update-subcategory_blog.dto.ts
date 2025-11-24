import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoryBlogDto } from './create-subcategory_blog.dto';

export class UpdateSubcategoryBlogDto extends PartialType(CreateSubcategoryBlogDto) {}
