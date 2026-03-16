import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string) {
    console.log(username, password);

    const user = await this.usersService.findOneOrFail({ where: { username } });
    console.log(user);

    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async getMe(userId: number) {
    const user = await this.usersService.findOneOrFail({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }

  async refreshTokens(user: any) {
    return this.login(user);
  }
}
