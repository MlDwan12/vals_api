import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { AppError } from '../exceptions/app-error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // -----------------------------
    // 1) AppError (твоя кастомная ошибка)
    // -----------------------------
    if (exception instanceof AppError) {
      return response.status(exception.status).json({
        success: false,
        code: exception.code,
        message: exception.message,
        status: exception.status,
        timestamp: new Date().toISOString(),
        details: exception.details ?? null,
      });
    }

    // -----------------------------
    // 2) HttpException (включая ValidationPipe)
    // -----------------------------
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      // res может быть string | object
      let message = exception.message;
      let details: any = null;
      let code = 'HTTP_ERROR';

      if (typeof res === 'string') {
        message = res;
      } else if (Array.isArray(res)) {
        message = res.join('; ');
      } else if (typeof res === 'object' && res !== null) {
        message = res['message'] ?? exception.message;
        details = res['details'] ?? res['errors'] ?? null;
        code = res['code'] ?? 'HTTP_ERROR';
      }

      return response.status(status).json({
        success: false,
        code,
        message,
        status,
        timestamp: new Date().toISOString(),
        details,
      });
    }

    // -----------------------------
    // 3) Любая другая ошибка
    // -----------------------------
    return response.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: exception?.message ?? 'Unknown error',
      status: 500,
      timestamp: new Date().toISOString(),
      // details: exception,
    });
  }
}
