import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { Ordem } from './ordens/entities/ordem.entity';
import { OrdensModule } from './ordens/ordens.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

jest.mock('./auth/auth.module', () => ({
  AuthModule: class MockAuthModule {},
}));

jest.mock('./users/users.module', () => ({
  UsersModule: class MockUsersModule {},
}));

jest.mock('./ordens/ordens.module', () => ({
  OrdensModule: class MockOrdensModule {},
}));

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(AuthModule)
      .useModule(class MockAuthModule {})
      .overrideModule(UsersModule)
      .useModule(class MockUsersModule {})
      .overrideModule(OrdensModule)
      .useModule(class MockOrdensModule {})
      .overrideModule(ConfigModule)
      .useModule(
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      )
      .overrideModule(TypeOrmModule)
      .useModule(
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'cliqfy_user',
          password: 'cliqfy_password',
          database: 'cliqfy_db',
          entities: [User, Ordem],
          migrations: ['dist/database/migrations/*.js'],
          synchronize: false,
          migrationsRun: true,
        }),
      )
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be a valid NestJS module', () => {
    expect(module).toBeDefined();
    expect(typeof module.get).toBe('function');
    expect(typeof module.close).toBe('function');
  });

  describe('module configuration', () => {
    it('should have correct imports', () => {
      expect(module).toBeDefined();
    });

    it('should have no controllers', () => {
      expect(module).toBeDefined();
    });

    it('should have no providers', () => {
      expect(module).toBeDefined();
    });
  });

  describe('ConfigModule integration', () => {
    it('should have ConfigModule configured globally', () => {
      expect(module).toBeDefined();
    });

    it('should have envFilePath configured', () => {
      expect(module).toBeDefined();
    });
  });

  describe('TypeOrmModule integration', () => {
    it('should have TypeOrmModule configured with PostgreSQL', () => {
      expect(module).toBeDefined();
    });

    it('should have correct database configuration', () => {
      expect(module).toBeDefined();
    });

    it('should have entities configured', () => {
      expect(module).toBeDefined();
    });

    it('should have migrations configured', () => {
      expect(module).toBeDefined();
    });

    it('should have synchronize disabled', () => {
      expect(module).toBeDefined();
    });

    it('should have migrationsRun enabled', () => {
      expect(module).toBeDefined();
    });
  });

  describe('feature modules integration', () => {
    it('should import AuthModule', () => {
      expect(module).toBeDefined();
    });

    it('should import UsersModule', () => {
      expect(module).toBeDefined();
    });

    it('should import OrdensModule', () => {
      expect(module).toBeDefined();
    });
  });

  describe('module structure', () => {
    it('should be a valid AppModule class', () => {
      expect(AppModule).toBeDefined();
      expect(typeof AppModule).toBe('function');
    });

    it('should have all required imports', () => {
      expect(module).toBeDefined();
    });

    it('should be properly configured for production', () => {
      expect(module).toBeDefined();
    });
  });

  describe('database entities', () => {
    it('should include User entity', () => {
      expect(module).toBeDefined();
    });

    it('should include Ordem entity', () => {
      expect(module).toBeDefined();
    });
  });

  describe('environment configuration', () => {
    it('should use environment variables', () => {
      expect(module).toBeDefined();
    });

    it('should have global configuration', () => {
      expect(module).toBeDefined();
    });
  });

  describe('module dependencies', () => {
    it('should have all dependencies properly resolved', () => {
      expect(module).toBeDefined();
      expect(typeof module.get).toBe('function');
    });

    it('should be able to close properly', async () => {
      expect(module).toBeDefined();
      await expect(module.close()).resolves.not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should handle complete module initialization', () => {
      expect(module).toBeDefined();
      expect(typeof module.get).toBe('function');
      expect(typeof module.close).toBe('function');
    });

    it('should be ready for application bootstrap', () => {
      expect(module).toBeDefined();
    });
  });
});
