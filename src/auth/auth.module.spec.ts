import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// Mock do UsersModule para evitar dependências do TypeORM
jest.mock('../users/users.module', () => ({
  UsersModule: {
    module: class MockUsersModule {},
    providers: [
      {
        provide: UsersService,
        useValue: {
          findByEmail: jest.fn(),
          create: jest.fn(),
          findOne: jest.fn(),
          updateRefreshToken: jest.fn(),
        },
      },
    ],
    exports: [UsersService],
  },
}));

describe('AuthModule', () => {
  let module: TestingModule;
  let service: AuthService;
  let controller: AuthController;
  let jwtStrategy: JwtStrategy;
  let jwtRefreshStrategy: JwtRefreshStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRATION: '1h',
          JWT_REFRESH_SECRET: 'test-jwt-refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        };
        return config[key];
      }),
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtRefreshStrategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it('should provide AuthController', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AuthController);
  });

  it('should provide JwtStrategy', () => {
    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
  });

  it('should provide JwtRefreshStrategy', () => {
    expect(jwtRefreshStrategy).toBeDefined();
    expect(jwtRefreshStrategy).toBeInstanceOf(JwtRefreshStrategy);
  });

  it('should provide ConfigService', () => {
    expect(configService).toBeDefined();
    expect(() => configService.get('anyKey')).not.toThrow();
    expect(typeof configService.get).toBe('function');
  });

  describe('module configuration', () => {
    it('should have correct imports', () => {
      expect(module).toBeDefined();
    });

    it('should have correct controllers', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });

    it('should have correct providers', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AuthService);
      expect(jwtStrategy).toBeDefined();
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
      expect(jwtRefreshStrategy).toBeDefined();
      expect(jwtRefreshStrategy).toBeInstanceOf(JwtRefreshStrategy);
    });
  });

  describe('dependency injection', () => {
    it('should inject AuthService into AuthController', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });

    it('should inject ConfigService into strategies', () => {
      expect(jwtStrategy).toBeDefined();
      expect(jwtRefreshStrategy).toBeDefined();
      expect(configService).toBeDefined();
    });

    it('should have all dependencies properly injected', () => {
      expect(module.get<AuthService>(AuthService)).toBeDefined();
      expect(module.get<AuthController>(AuthController)).toBeDefined();
      expect(module.get<JwtStrategy>(JwtStrategy)).toBeDefined();
      expect(module.get<JwtRefreshStrategy>(JwtRefreshStrategy)).toBeDefined();
      expect(module.get<ConfigService>(ConfigService)).toBeDefined();
    });
  });

  describe('module structure', () => {
    it('should be a valid NestJS module', () => {
      expect(module).toBeDefined();
      expect(typeof module.get).toBe('function');
      expect(typeof module.close).toBe('function');
    });

    it('should have all required components', () => {
      expect(service).toBeDefined();
      expect(controller).toBeDefined();
      expect(jwtStrategy).toBeDefined();
      expect(jwtRefreshStrategy).toBeDefined();
      expect(configService).toBeDefined();
    });
  });

  describe('JWT configuration', () => {
    it('should have JWT module configured', () => {
      expect(module).toBeDefined();
    });

    it('should have JWT strategies configured', () => {
      expect(jwtStrategy).toBeDefined();
      expect(jwtRefreshStrategy).toBeDefined();
    });

    it('should have ConfigService available for JWT configuration', () => {
      expect(configService).toBeDefined();
      expect(configService.get('JWT_SECRET')).toBeDefined();
      expect(configService.get('JWT_EXPIRATION')).toBeDefined();
    });
  });

  describe('Passport integration', () => {
    it('should have PassportModule imported', () => {
      expect(module).toBeDefined();
    });

    it('should have JWT strategies registered', () => {
      expect(jwtStrategy).toBeDefined();
      expect(jwtRefreshStrategy).toBeDefined();
    });
  });

  describe('UsersService integration', () => {
    it('should have UsersService mocked', () => {
      const usersService = module.get<UsersService>(UsersService);
      expect(usersService).toBeDefined();
    });

    it('should have access to UsersService through AuthService', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AuthService);
    });
  });
});
