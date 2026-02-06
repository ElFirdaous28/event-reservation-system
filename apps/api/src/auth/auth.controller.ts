import { Controller, Post, Body, Res, UnauthorizedException, Get, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) { }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict',
        });
    }

    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.register(createUserDto);
        const tokens = await this.authService.login(user);

        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, message: 'Registration successful' };
    }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.authService.login(user);
        this.setRefreshTokenCookie(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, message: 'Login successful' };
    }

    @Post('refresh')
    async refresh(@Res({ passthrough: true }) res: Response, @Body('refreshToken') bodyRefreshToken?: string, @Req() req?: Request) {
        // Get token from cookie if not in body
        const token = bodyRefreshToken || (req && req.cookies['refreshToken']);
        if (!token) throw new UnauthorizedException('No refresh token');

        const tokens = await this.authService.refreshTokens(token);
        this.setRefreshTokenCookie(res, tokens.refreshToken);

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
        return this.usersService.findOne(userId); // or return only safe fields
    }
}