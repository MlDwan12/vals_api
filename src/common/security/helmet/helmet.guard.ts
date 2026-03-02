import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import helmet from 'helmet';

@Injectable()
export class HelmetGuard implements CanActivate {
  private readonly helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // ужесточи по своему фронту
        fontSrc: ["'self'", 'https:', 'data:'],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
  });

  canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    return new Promise<boolean>((resolve) => {
      this.helmetMiddleware(req, res, () => resolve(true));
    });
  }
}
