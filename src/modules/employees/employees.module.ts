import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeesAdminController } from './employees-admin.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeRepository } from './employees.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeesController, EmployeesAdminController],
  providers: [EmployeesService, EmployeeRepository],
  exports: [EmployeeRepository],
})
export class EmployeesModule {}
