import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    fullName: 'Test User',
    role: 'PARTICIPANT',
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'PARTICIPANT',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct password', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toHaveProperty('email', email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not return password in result', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).not.toHaveProperty('password');
    });

    it('should call toObject method on user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser(email, password);

      expect(mockUser.toObject).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'PARTICIPANT',
      };

      const mockAccessToken = 'access_token_123';
      const mockRefreshToken = 'refresh_token_123';

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken as any)
        .mockReturnValueOnce(mockRefreshToken as any);

      const result = await service.generateTokens(user);

      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
    });

    it('should include user data in token payload', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'PARTICIPANT',
      };

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('token' as any)
        .mockReturnValueOnce('token' as any);

      await service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          sub: '507f1f77bcf86cd799439011',
          role: 'PARTICIPANT',
          fullName: 'Test User',
        }),
        expect.any(Object),
      );
    });

    it('should set correct expiration times', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'PARTICIPANT',
      };

      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('token' as any)
        .mockReturnValueOnce('token' as any);

      await service.generateTokens(user);

      const calls = (jwtService.sign as jest.Mock).mock.calls;
      expect(calls[0][1]).toEqual(
        expect.objectContaining({
          expiresIn: '15m',
        }),
      );
      expect(calls[1][1]).toEqual(
        expect.objectContaining({
          expiresIn: '7d',
        }),
      );
    });
  });

  describe('login', () => {
    it('should return tokens for user', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'PARTICIPANT',
      };

      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jest
        .spyOn(service, 'generateTokens')
        .mockResolvedValue(mockTokens);

      const result = await service.login(user);

      expect(service.generateTokens).toHaveBeenCalledWith(user);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };

      const createdUser = { ...createUserDto, _id: 'new_id' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(createdUser as any);

      const result = await service.register(createUserDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Existing User',
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should handle MongoDB duplicate key error', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue({ code: 11000 });

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should re-throw other errors from create', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const otherError = new Error('Some other error');

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(otherError);

      await expect(service.register(createUserDto)).rejects.toThrow(
        otherError,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = {
        email: 'test@example.com',
      };

      const mockNewTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValue(payload as any);
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(service, 'generateTokens')
        .mockResolvedValue(mockNewTokens);

      const result = await service.refreshTokens(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.objectContaining({
          secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
        }),
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual(mockNewTokens);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalid_token';

      jest
        .spyOn(jwtService, 'verify')
        .mockImplementation(() => {
          throw new Error('Invalid token');
        });

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid_token';
      const payload = {
        email: 'nonexistent@example.com',
      };

      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValue(payload as any);
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use default refresh secret if env var not set', async () => {
      const refreshToken = 'token';
      const payload = { email: 'test@example.com' };

      delete process.env.JWT_REFRESH_SECRET;

      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValue(payload as any);
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(service, 'generateTokens')
        .mockResolvedValue({
          accessToken: 'token',
          refreshToken: 'token',
        });

      await service.refreshTokens(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshToken,
        expect.objectContaining({
          secret: 'refreshSecret',
        }),
      );
    });
  });
});
