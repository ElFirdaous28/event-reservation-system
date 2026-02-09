import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { LoginCredentials } from '@repo/shared';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(createUserDto);
    const tokens = this.authService.login(user);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    // Only return accessToken, NOT refreshToken
    return {
      accessToken: tokens.accessToken,
      message: 'Registration successful',
    };
  }

  @Post('login')
  async login(
    @Body() credentials: LoginCredentials,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );
    const tokens = this.authService.login(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    // Only return accessToken, NOT refreshToken
    return { accessToken: tokens.accessToken, message: 'Login successful' };
  }

  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // Get token from cookie only (more secure)
    const token = req.cookies['refreshToken'];
    if (!token) throw new UnauthorizedException('No refresh token');

    const tokens = await this.authService.refreshTokens(token);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    // Only return accessToken, NOT refreshToken
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    // The JwtAuthGuard will attach the user to req.user
    const userId = req.user!.sub;
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Return only safe fields (no password)
    const userObj = user.toObject ? user.toObject() : user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = userObj as any;
    return safeUser;
  }
}
