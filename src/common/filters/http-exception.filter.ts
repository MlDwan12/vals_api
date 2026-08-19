import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { AppError } from '../exceptions/app-error';
import { AuditAction } from 'src/modules/audit/entities/audit-log.entity';
import { AuditService } from 'src/modules/audit/audit.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly auditService: AuditService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // -----------------------------
    // 1) AppError (твоя кастомная ошибка)
    // -----------------------------
    if (exception instanceof AppError) {
      this.writeAuditLog(request, exception.status, exception.message);
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

      this.writeAuditLog(request, status, message);

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
    const unknownMessage = exception?.message ?? 'Неизвестная ошибка';
    this.writeAuditLog(request, 500, unknownMessage);

    return response.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: unknownMessage,
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }

  private writeAuditLog(
    request: any,
    statusCode: number,
    errorMessage: string,
  ): void {
    const method: string = request.method?.toUpperCase() ?? 'GET';
    const rawPath: string = (request.url as string)?.split('?')[0] ?? '/';

    const isMutation = ['POST', 'PATCH', 'DELETE'].includes(method);
    const isAuthPath = rawPath.startsWith('/auth/');
    const isSecurityEvent = statusCode === 401 || statusCode === 403;
    const isServerError = statusCode >= 500;

    // Only log mutations, auth paths, security events and server errors
    if (!isMutation && !isAuthPath && !isSecurityEvent && !isServerError) return;

    const user = request.user as
      | { id?: number; username?: string; role?: string }
      | undefined;

    let username: string | null = user?.username ?? null;
    // For login failures, grab the attempted username from the body
    if (rawPath === '/auth/login' && !username) {
      username = (request.body as any)?.username ?? null;
    }

    const action =
      isSecurityEvent ? AuditAction.ACCESS_DENIED : AuditAction.ERROR;

    const parts = rawPath.replace(/^\//, '').split('/');
    const resource = parts[0] || 'unknown';
    const second = parts[1];
    const resourceId =
      second && /^\d+$/.test(second) ? parseInt(second, 10) : null;

    const forwarded = request.headers?.['x-forwarded-for'];
    const ip: string | null = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : (request.ip ?? null);

    this.auditService
      .log({
        userId: user?.id ?? null,
        username,
        role: user?.role ?? null,
        action,
        method,
        path: rawPath,
        resource,
        resourceId,
        statusCode,
        errorMessage,
        ip,
      })
      .catch(() => undefined);
  }
}
