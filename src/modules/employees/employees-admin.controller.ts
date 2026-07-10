import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/core/crud/base.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CONTENT_ROLES } from 'src/common/constants/roles.constant';
import type { PaginationResult } from 'src/core/crud/interfaces/pagination.interface';

@ApiTags('Команда (админ)')
@Controller('admin/employees')
export class EmployeesAdminController extends BaseCrudController<
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  protected entityName!: string;

  constructor(protected readonly service: EmployeesService) {
    super(service);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список всех сотрудников (с пагинацией, включая скрытых)' })
  async paginate(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginationResult<Employee>> {
    return this.service.paginate({}, { page: +page, limit: +limit });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CONTENT_ROLES)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить сотрудника по ID' })
  @ApiOkResponse({ description: 'Сотрудник найден' })
  @ApiNotFoundResponse({ description: 'Сотрудник не найден' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Employee> {
    return this.service.findById(id);
  }
}
