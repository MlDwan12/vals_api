import { SubCategory } from 'src/modules/subcategory/entities/subcategory.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => SubCategory, (sub) => sub.category)
  subcategories: SubCategory[];
}
