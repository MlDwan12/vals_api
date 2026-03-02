import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  username: string;
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
    return payload;
  }
}
