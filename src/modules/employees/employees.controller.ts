import { Controller, Get, Param } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Employee } from './entities/employee.entity';

@ApiTags('Команда')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get('published')
  @ApiOperation({ summary: 'Список видимых сотрудников — блок «Команда» (сайт)' })
  @ApiOkResponse({ description: 'Список сотрудников' })
  async getPublishedList(): Promise<Employee[]> {
    return this.service.findPublishedList();
  }

  @Get('info/:slug')
  @ApiOperation({ summary: 'Получить сотрудника по slug (сайт)' })
  @ApiOkResponse({ description: 'Сотрудник найден' })
  @ApiNotFoundResponse({ description: 'Сотрудник не найден или скрыт' })
  async getEmployeeInfo(@Param('slug') slug: string): Promise<Employee> {
    return this.service.findPublishedBySlugOrFail(slug);
  }
}
