import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../exceptions/app-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = req.url;

    if (exception instanceof AppError) {
      return res.status(exception.status).json({
        success: false,
        code: exception.code,
        message: exception.message,
        status: exception.status,
        timestamp,
        path,
        details: exception.details,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response: any = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response?.message ?? exception.message);

      return res.status(status).json({
        success: false,
        code: 'HTTP_ERROR',
        message,
        status,
        timestamp,
        path,
        details: response,
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      status: 500,
      timestamp,
      path,
    });
  }
}
