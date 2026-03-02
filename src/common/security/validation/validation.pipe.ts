import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class GlobalValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: this.formatErrors(errors),
        text: this.formatErrorsAsText(errors), // ← добавляем человекочитаемый текст
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    const traverse = (error: ValidationError, parentPath = '') => {
      const property = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        result[property] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => traverse(child, property));
      }
    };

    errors.forEach((error) => traverse(error));
    return result;
  }

  // Новый метод — делает один текст ошибки, удобный для чтения
  private formatErrorsAsText(errors: ValidationError[]): string {
    const messages: string[] = [];

    const traverse = (error: ValidationError, parentPath = '') => {
      const fieldPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        for (const msg of Object.values(error.constraints)) {
          messages.push(`${fieldPath}: ${msg}`);
        }
      }

      if (error.children?.length) {
        error.children.forEach((child) => traverse(child, fieldPath));
      }
    };

    errors.forEach((e) => traverse(e));
    return messages.join('; ');
  }
}
