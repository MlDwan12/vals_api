import { Type } from '@nestjs/common';

export interface BaseControllerOptions {
  entityName?: string;
  createDto?: Type<any>;
  updateDto?: Type<any>;
}
