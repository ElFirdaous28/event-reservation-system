import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async generateTokens(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id,
      role: user.role,
      fullName: user.fullName
    };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'accessSecret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(user: any) {
    return this.generateTokens(user);
  }

  async register(userDto: any) {
    const user = await this.usersService.create(userDto);
    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      });
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
