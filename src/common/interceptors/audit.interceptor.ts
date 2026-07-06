import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditAction } from 'src/modules/audit/entities/audit-log.entity';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method.toUpperCase();
    const rawPath: string = (req.url as string).split('?')[0];

    const isAuthLogout = rawPath === '/auth/logout';
    const isMutation = ['POST', 'PATCH', 'DELETE'].includes(method);

    if (!isMutation && !isAuthLogout) {
      return next.handle();
    }

    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap((data) => {
        const statusCode: number = res.statusCode;
        const user = req.user as
          | { id?: number; username?: string; role?: string }
          | undefined;

        let userId: number | null = user?.id ?? null;
        let username: string | null = user?.username ?? null;
        let role: string | null = user?.role ?? null;

        // For login the JWT user isn't set — extract from response payload
        if (rawPath === '/auth/login' && data) {
          username = data.login ?? username;
          role = data.role ?? role;
        }

        const action = this.resolveAction(method, rawPath);
        const { resource, resourceId } = this.extractResource(rawPath);
        const ip = this.getIp(req);

        this.logger.log(
          { userId, username, role, action, method, path: rawPath, statusCode },
          `AUDIT ${action}`,
        );

        this.auditService
          .log({ userId, username, role, action, method, path: rawPath, resource, resourceId, statusCode, ip })
          .catch((err) => this.logger.error({ err }, 'Failed to save audit log'));
      }),
    );
  }

  private resolveAction(method: string, path: string): string {
    if (path === '/auth/login') return AuditAction.LOGIN;
    if (path === '/auth/logout') return AuditAction.LOGOUT;
    if (method === 'POST') return AuditAction.CREATE;
    if (method === 'PATCH') return AuditAction.UPDATE;
    if (method === 'DELETE') return AuditAction.DELETE;
    return AuditAction.CREATE;
  }

  private extractResource(path: string): {
    resource: string;
    resourceId: number | null;
  } {
    const parts = path.replace(/^\//, '').split('/');
    const resource = parts[0] || 'unknown';
    const second = parts[1];
    const resourceId =
      second && /^\d+$/.test(second) ? parseInt(second, 10) : null;
    return { resource, resourceId };
  }

  private getIp(req: any): string | null {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) return (forwarded as string).split(',')[0].trim();
    return req.ip ?? null;
  }
}
