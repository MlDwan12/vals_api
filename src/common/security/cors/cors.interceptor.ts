import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    response.header(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || '*',
    );
    response.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
    );
    response.header('Access-Control-Allow-Credentials', 'true');

    // Предобработка OPTIONS
    if (context.switchToHttp().getRequest().method === 'OPTIONS') {
      response.status(200).send();
      return new Observable((observer) => observer.complete());
    }

    return next.handle();
  }
}
