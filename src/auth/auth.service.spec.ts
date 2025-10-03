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
    refreshToken: 'hashed-refresh-token',
    createdAt: new Date(),
    updatedAt: new Date(),
    ordensCriadas: [],
    ordensResponsavel: [],
  } as User;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneWithRefreshToken: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
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
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

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
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        tokens.refresh_token,
      );
      expect(result).toEqual({
        ...tokens,
        user: expect.objectContaining({
          id: mockUser.id,
          nome: mockUser.nome,
          email: mockUser.email,
          role: mockUser.role,
          ativo: mockUser.ativo,
        }),
      });
      expect(result.user).not.toHaveProperty('senha');
      expect(result.user).not.toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
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

      await expect(service.login(loginDto)).rejects.toThrow(
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

      await expect(service.login(loginDto)).rejects.toThrow(
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
      const tokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };
      const userWithoutSensitiveData = {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role,
        ativo: newUser.ativo,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        ordensCriadas: [],
        ordensResponsavel: [],
      };

      mockUsersService.create.mockResolvedValue(newUser);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue(tokens);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
      mockUsersService.findOne.mockResolvedValue(userWithoutSensitiveData);

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(service['generateTokens']).toHaveBeenCalledWith(
        newUser.id,
        newUser.email,
        newUser.role,
      );
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        newUser.id,
        tokens.refresh_token,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(newUser.id);
      expect(result).toEqual({
        ...tokens,
        user: userWithoutSensitiveData,
      });
    });
  });

  describe('refreshToken', () => {
    const userId = 'user-uuid-123';
    const refreshToken = 'valid-refresh-token';

    it('should refresh token successfully', async () => {
      const accessToken = 'new-access-token';
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashed-refresh-token',
      };

      mockUsersService.findOne.mockResolvedValue(userWithRefreshToken);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.refreshToken(userId, refreshToken);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        userWithRefreshToken.refreshToken,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userWithRefreshToken.id,
        email: userWithRefreshToken.email,
        role: userWithRefreshToken.role,
      });
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user has no refresh token', async () => {
      const userWithoutRefreshToken = { ...mockUser, refreshToken: null };
      mockUsersService.findOne.mockResolvedValue(userWithoutRefreshToken);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'hashed-refresh-token',
      };
      mockUsersService.findOne.mockResolvedValue(userWithRefreshToken);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        userWithRefreshToken.refreshToken,
      );
    });
  });

  describe('logout', () => {
    const userId = 'user-uuid-123';

    it('should logout successfully', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(userId);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
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
