/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {},
}));

jest.mock('./guards/jwt-refresh.guard', () => ({
  JwtRefreshGuard: class MockJwtRefreshGuard {},
}));

jest.mock('./decorators/current-user.decorator', () => ({
  CurrentUser: () => (): void => {},
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: 'uuid-123',
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

  const mockAuthResponse = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    user: {
      id: 'uuid-123',
      nome: 'Test User',
      email: 'test@test.com',
      role: UserRole.AGENT,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and set refresh token cookie', async () => {
      const registerDto: RegisterDto = {
        nome: 'New User',
        email: 'new@test.com',
        senha: 'password123',
        role: UserRole.VIEWER,
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
      expect(result).toEqual({
        access_token: 'access-token',
        user: mockAuthResponse.user,
      });
      expect(result).not.toHaveProperty('refresh_token');
    });

    it('should handle register errors', async () => {
      const registerDto: RegisterDto = {
        nome: 'New User',
        email: 'new@test.com',
        senha: 'password123',
        role: UserRole.VIEWER,
      };

      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(
        controller.register(registerDto, mockResponse),
      ).rejects.toThrow('Registration failed');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and set refresh token cookie', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        senha: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
      expect(result).toEqual({
        access_token: 'access-token',
        user: mockAuthResponse.user,
      });
      expect(result).not.toHaveProperty('refresh_token');
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        senha: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      } as any;

      const refreshResult = {
        access_token: 'new-access-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(refreshResult);

      const result = await controller.refresh(mockUser, mockRequest);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'uuid-123',
        'refresh-token',
      );
      expect(result).toEqual(refreshResult);
    });

    it('should handle refresh errors', async () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'invalid-refresh-token',
        },
      } as any;

      const error = new Error('Invalid refresh token');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refresh(mockUser, mockRequest)).rejects.toThrow(
        'Invalid refresh token',
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'uuid-123',
        'invalid-refresh-token',
      );
    });

    it('should handle missing refresh token in cookies', async () => {
      const mockRequest = {
        cookies: {},
      } as any;

      const refreshResult = {
        access_token: 'new-access-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(refreshResult);

      const result = await controller.refresh(mockUser, mockRequest);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'uuid-123',
        undefined,
      );
      expect(result).toEqual(refreshResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without sensitive data', () => {
      const result = controller.getProfile(mockUser);

      expect(result).toEqual({
        id: 'uuid-123',
        nome: 'Test User',
        email: 'test@test.com',
        role: UserRole.AGENT,
        ativo: true,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        ordensCriadas: [],
        ordensResponsavel: [],
      });
      expect(result).not.toHaveProperty('senha');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should handle user with null refreshToken', () => {
      const userWithoutRefreshToken = {
        ...mockUser,
        refreshToken: null,
      } as unknown as User;

      const result = controller.getProfile(userWithoutRefreshToken);

      expect(result).not.toHaveProperty('senha');
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockUser, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('uuid-123');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValue(error);

      await expect(controller.logout(mockUser, mockResponse)).rejects.toThrow(
        'Logout failed',
      );
      expect(authService.logout).toHaveBeenCalledWith('uuid-123');
      expect(mockResponse.clearCookie).not.toHaveBeenCalled();
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set cookie with correct options in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      (controller as any).setRefreshTokenCookie(mockRes, 'test-token');

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'test-token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should set cookie with secure option in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      (controller as any).setRefreshTokenCookie(mockRes, 'test-token');

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'test-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('integration tests', () => {
    it('should handle complete authentication flow', async () => {
      const registerDto: RegisterDto = {
        nome: 'Integration User',
        email: 'integration@test.com',
        senha: 'password123',
        role: UserRole.AGENT,
      };

      const loginDto: LoginDto = {
        email: 'integration@test.com',
        senha: 'password123',
      };

      const mockRequest = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      } as any;

      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const registerResult = await controller.register(
        registerDto,
        mockResponse,
      );
      expect(registerResult).not.toHaveProperty('refresh_token');

      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const loginResult = await controller.login(loginDto, mockResponse);
      expect(loginResult).toEqual({
        access_token: 'access-token',
        user: mockAuthResponse.user,
      });
      expect(loginResult).not.toHaveProperty('refresh_token');

      const refreshResult = { access_token: 'new-access-token' };
      mockAuthService.refreshToken.mockResolvedValue(refreshResult);
      const refreshResponse = await controller.refresh(mockUser, mockRequest);
      expect(refreshResponse).toEqual(refreshResult);

      mockAuthService.logout.mockResolvedValue(undefined);
      const logoutResult = await controller.logout(mockUser, mockResponse);
      expect(logoutResult).toEqual({ message: 'Logout realizado com sucesso' });

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'uuid-123',
        'refresh-token',
      );
      expect(authService.logout).toHaveBeenCalledWith('uuid-123');

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});
