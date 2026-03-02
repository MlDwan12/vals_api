import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import type { Request, Response } from 'express';
import { RefreshGuard } from './jwt-auth.guard';

export interface AuthRequest extends Request {
  user: {
    id: number;
    username: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) throw new UnauthorizedException();

    const tokens = await this.authService.login(user);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return { message: 'ok' };
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(req.user);

    res.cookie('accessToken', tokens.accessToken, { httpOnly: true });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });

    return { message: 'refreshed' };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'logout' };
  }
}
