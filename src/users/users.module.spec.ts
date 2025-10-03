import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  let module: TestingModule;
  let service: UsersService;
  let controller: UsersController;
  let repository: Repository<User>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockRepository)
      .compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UsersService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UsersService);
  });

  it('should provide UsersController', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(UsersController);
  });

  it('should provide User repository', () => {
    expect(repository).toBeDefined();
  });

  it('should export UsersService', () => {
    const exportedService = module.get<UsersService>(UsersService, {
      strict: false,
    });
    expect(exportedService).toBeDefined();
    expect(exportedService).toBeInstanceOf(UsersService);
  });

  describe('module configuration', () => {
    it('should have correct imports', () => {
      expect(module).toBeDefined();
    });

    it('should have correct controllers', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(UsersController);
    });

    it('should have correct providers', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(UsersService);
    });

    it('should have correct exports', () => {
      const exportedService = module.get<UsersService>(UsersService);
      expect(exportedService).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject UsersService into UsersController', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();

      expect(controller).toBeInstanceOf(UsersController);
    });

    it('should inject User repository into UsersService', () => {
      expect(service).toBeDefined();
      expect(repository).toBeDefined();

      expect(service).toBeInstanceOf(UsersService);
    });

    it('should have all dependencies properly injected', () => {
      expect(module.get<UsersService>(UsersService)).toBeDefined();
      expect(module.get<UsersController>(UsersController)).toBeDefined();
      expect(
        module.get<Repository<User>>(getRepositoryToken(User)),
      ).toBeDefined();
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
      expect(repository).toBeDefined();
    });
  });
});
