import { Injectable } from '@nestjs/common';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EMPLOYEE_MAIN_FIELDS } from './queries/employee.selects';

@Injectable()
export class EmployeeRepository extends BaseCrudRepository<Employee> {
  constructor(
    @InjectRepository(Employee)
    repo: Repository<Employee>,
  ) {
    super(repo, Employee);
  }

  /** Публичный эндпоинт — блок «Команда» на «О компании» */
  async findPublishedList(): Promise<Employee[]> {
    return this.repository
      .createQueryBuilder('employee')
      .select([...EMPLOYEE_MAIN_FIELDS])
      .where('employee.isVisible = true')
      .orderBy('employee.priority', 'DESC')
      .addOrderBy('employee.id', 'ASC')
      .getMany();
  }

  /** Публичный эндпоинт — персональная страница /ob-avtore/:slug */
  async findBySlugPublished(slug: string): Promise<Employee | null> {
    return this.repository.findOne({ where: { slug, isVisible: true } });
  }
}
