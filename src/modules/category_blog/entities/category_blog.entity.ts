import { SubCategoryBlog } from 'src/modules/subcategory_blog/entities/subcategory_blog.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'category_blog' })
export class CategoryBlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => SubCategoryBlog, (sub) => sub.category)
  subcategories: SubCategoryBlog[];
}
