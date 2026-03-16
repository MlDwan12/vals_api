import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { SecurityConfig } from '../../shared/types/config/security.config.type';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class DomainRestrictionGuard implements CanActivate {
  private readonly allowedOrigins: Set<string>;

  constructor(private readonly configService: ConfigService) {
    const securityConfig =
      this.configService.getOrThrow<SecurityConfig>('security');

    this.allowedOrigins = new Set(securityConfig.allowedMutationOrigins);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (!MUTATION_METHODS.has(method)) {
      return true;
    }

    const originHeader = request.headers.origin;
    console.log('originHeader=====>', originHeader);

    if (typeof originHeader !== 'string' || originHeader.length === 0) {
      throw new ForbiddenException(
        'Origin header is required for mutation requests',
      );
    }

    if (!this.allowedOrigins.has(originHeader)) {
      throw new ForbiddenException('Origin is not allowed for this operation');
    }

    return true;
  }
}
