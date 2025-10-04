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
    createdAt: new Date(),
    updatedAt: new Date(),
    ordensCriadas: [],
    ordensResponsavel: [],
  } as User;

  const mockAuthResponse = {
    access_token: 'access-token',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
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
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        nome: 'New User',
        email: 'new@test.com',
        senha: 'password123',
        role: UserRole.VIEWER,
      };

      const mockUser = {
        id: 'uuid-456',
        nome: 'New User',
        email: 'new@test.com',
        senha: 'hashed-password',
        role: UserRole.VIEWER,
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ordensCriadas: [],
        ordensResponsavel: [],
      } as User;

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUser);
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
    });
  });

  describe('login', () => {
    it('should login user and set refresh token cookie', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        senha: 'password123',
      };

      mockAuthService.login.mockImplementation((dto, res) => {
        res.cookie('refresh_token', 'mock-refresh-token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
        return mockAuthResponse;
      });

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto, mockResponse);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock-refresh-token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        },
      );
      expect(result).toEqual(mockAuthResponse);
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
      expect(authService.login).toHaveBeenCalledWith(loginDto, mockResponse);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh access token', () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'refresh-token',
        },
      } as any;

      const refreshResult = {
        access_token: 'new-access-token',
      };

      mockAuthService.refreshToken.mockReturnValue(refreshResult);

      const result = controller.refresh(mockRequest);

      expect(authService.refreshToken).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(refreshResult);
    });

    it('should handle refresh errors', () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'invalid-refresh-token',
        },
      } as any;

      const error = new Error('Invalid refresh token');
      mockAuthService.refreshToken.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.refresh(mockRequest)).toThrow(
        'Invalid refresh token',
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle missing refresh token in cookies', () => {
      const mockRequest = {
        cookies: {},
      } as any;

      const error = new Error('No refresh token found');
      mockAuthService.refreshToken.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.refresh(mockRequest)).toThrow(
        'No refresh token found',
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRequest);
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
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', () => {
      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
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

      const mockUser = {
        id: 'uuid-456',
        nome: 'Integration User',
        email: 'integration@test.com',
        senha: 'hashed-password',
        role: UserRole.AGENT,
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ordensCriadas: [],
        ordensResponsavel: [],
      } as User;

      mockAuthService.register.mockResolvedValue(mockUser);
      const registerResult = await controller.register(
        registerDto,
        mockResponse,
      );
      expect(registerResult).toEqual(mockUser);

      mockAuthService.login.mockImplementation((dto, res) => {
        res.cookie('refresh_token', 'mock-refresh-token', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
        return mockAuthResponse;
      });
      const loginResult = await controller.login(loginDto, mockResponse);
      expect(loginResult).toEqual(mockAuthResponse);

      const refreshResult = { access_token: 'new-access-token' };
      mockAuthService.refreshToken.mockReturnValue(refreshResult);
      const refreshResponse = controller.refresh(mockRequest);
      expect(refreshResponse).toEqual(refreshResult);

      const logoutResult = controller.logout(mockResponse);
      expect(logoutResult).toEqual({ message: 'Logout realizado com sucesso' });

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto, mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(mockRequest);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});
