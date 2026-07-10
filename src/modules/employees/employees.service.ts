import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { BaseCrudService } from 'src/core/crud/base.service';
import { EmployeeRepository } from './employees.repository';
import { PinoLogger } from 'nestjs-pino';

const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class EmployeesService extends BaseCrudService<
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  constructor(
    protected readonly logger: PinoLogger,
    protected readonly repository: EmployeeRepository,
  ) {
    super(logger);
  }

  /** Публичный эндпоинт — блок «Команда» на «О компании» */
  async findPublishedList(): Promise<Employee[]> {
    return this.repository.findPublishedList();
  }

  /** Публичный эндпоинт — персональная страница /ob-avtore/:slug */
  async findPublishedBySlugOrFail(slug: string): Promise<Employee> {
    const employee = await this.repository.findBySlugPublished(slug);

    if (!employee) {
      throw new NotFoundException(`Сотрудник со slug "${slug}" не найден`);
    }

    return employee;
  }

  /** Удаление блокируется на уровне FK (article_authors/case_authors без CASCADE) — здесь только понятное сообщение вместо сырой ошибки Postgres. */
  async remove(id: number): Promise<void> {
    try {
      await super.remove(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as { code?: string }).code === POSTGRES_FOREIGN_KEY_VIOLATION
      ) {
        throw new BadRequestException(
          'Нельзя удалить сотрудника — у него есть статьи или кейсы. Сначала снимите привязку или скройте сотрудника (isVisible: false).',
        );
      }
      throw error;
    }
  }
}
