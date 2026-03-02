import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Logger } from 'nestjs-pino';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('Auth request started');
    try {
      this.logger.debug('Trying access token validation');
      const result = (await super.canActivate(context)) as boolean;

      if (result) {
        this.logger.debug('Access token valid');
        return true;
      }
    } catch (error) {
      this.logger.warn('Access token invalid or expired', error?.message);
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      this.logger.warn('No refresh token in cookies');
      throw new UnauthorizedException();
    }
    try {
      const refreshGuard = new (AuthGuard('jwt-refresh'))();
      const refreshValid = await refreshGuard.canActivate(context);

      if (!refreshValid) {
        throw new UnauthorizedException();
      }

      const user = request.user;

      this.logger.debug(`Refresh token valid for user ${JSON.stringify(user)}`);

      const tokens = await this.authService.refreshTokens(user);

      response.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
      });

      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
      });

      this.logger.log('Tokens successfully refreshed and cookies updated');

      return true;
    } catch (error) {
      this.logger.error('Refresh token validation failed', error?.stack);

      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}

@Injectable()
export class RefreshGuard extends AuthGuard('jwt-refresh') {}
