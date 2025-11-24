import { Category } from 'src/modules/category/entities/category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'subcategory' })
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (cat) => cat.subcategories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;
}
