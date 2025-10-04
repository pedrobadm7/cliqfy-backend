import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-uuid-123',
    nome: 'Test User',
    email: 'test@test.com',
    senha: 'hashed-password',
    role: UserRole.AGENT,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ordensCriadas: [],
    ordensResponsavel: [],
  } as User;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@test.com',
      senha: 'password123',
    };

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    it('should login successfully with valid credentials', async () => {
      const tokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);

      const result = await service.login(loginDto, mockResponse);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.senha,
        mockUser.senha,
      );
      expect(service['generateTokens']).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        tokens.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        },
      );
      expect(result).toEqual({
        access_token: tokens.access_token,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.senha,
        mockUser.senha,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, ativo: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.senha,
        inactiveUser.senha,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nome: 'New User',
      email: 'new@test.com',
      senha: 'password123',
      role: UserRole.VIEWER,
    };

    it('should register a new user successfully', async () => {
      const newUser = { ...mockUser, ...registerDto };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.register(registerDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.senha, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        senha: 'hashed-password',
      });
      expect(result).toEqual(newUser);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', () => {
      const accessToken = 'new-access-token';
      const mockRequest = {
        cookies: {
          refresh_token: 'valid-refresh-token',
        },
      } as any;

      mockConfigService.get
        .mockReturnValueOnce('jwt-refresh-secret')
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('1h');

      mockJwtService.verify.mockReturnValue({
        sub: 'user-uuid-123',
        email: 'test@test.com',
        role: UserRole.AGENT,
      });

      mockJwtService.sign.mockReturnValue(accessToken);

      const result = service.refreshToken(mockRequest);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        { secret: 'jwt-refresh-secret' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          email: 'test@test.com',
          role: UserRole.AGENT,
          sub: 'user-uuid-123',
        },
        {
          secret: 'jwt-secret',
          expiresIn: '1h',
        },
      );
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw UnauthorizedException if no refresh token found', () => {
      const mockRequest = {
        cookies: {},
      } as any;

      expect(() => service.refreshToken(mockRequest)).toThrow(
        UnauthorizedException,
      );
      expect(() => service.refreshToken(mockRequest)).toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if refresh token is invalid', () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'invalid-refresh-token',
        },
      } as any;

      mockConfigService.get.mockReturnValue('jwt-refresh-secret');
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.refreshToken(mockRequest)).toThrow(
        UnauthorizedException,
      );
      expect(() => service.refreshToken(mockRequest)).toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('generateTokens', () => {
    const userId = 'user-uuid-123';
    const email = 'test@test.com';
    const role = UserRole.AGENT;

    it('should generate access and refresh tokens', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockConfigService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('1h')
        .mockReturnValueOnce('jwt-refresh-secret')
        .mockReturnValueOnce('7d');

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service['generateTokens'](userId, email, role);

      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_EXPIRATION');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'JWT_REFRESH_EXPIRATION',
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email, role },
        {
          secret: 'jwt-secret',
          expiresIn: '1h',
        },
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email, role },
        {
          secret: 'jwt-refresh-secret',
          expiresIn: '7d',
        },
      );

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });
  });
});
