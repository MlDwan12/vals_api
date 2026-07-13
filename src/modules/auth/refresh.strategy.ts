import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRole } from '../users/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
