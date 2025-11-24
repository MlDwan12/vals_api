import { CategoryBlog } from 'src/modules/category_blog/entities/category_blog.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'subcategory_blog' })
export class SubCategoryBlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CategoryBlog, (cat) => cat.subcategories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: CategoryBlog;
}
