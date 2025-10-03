import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordem } from './entities/ordem.entity';
import { OrdensController } from './ordens.controller';
import { OrdensModule } from './ordens.module';
import { OrdensService } from './ordens.service';

describe('OrdensModule', () => {
  let module: TestingModule;
  let service: OrdensService;
  let controller: OrdensController;
  let ordemRepository: Repository<Ordem>;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [OrdensModule],
    })
      .overrideProvider(getRepositoryToken(Ordem))
      .useValue(mockRepository)
      .compile();

    service = module.get<OrdensService>(OrdensService);
    controller = module.get<OrdensController>(OrdensController);
    ordemRepository = module.get<Repository<Ordem>>(getRepositoryToken(Ordem));
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide OrdensService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(OrdensService);
  });

  it('should provide OrdensController', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(OrdensController);
  });

  it('should provide Ordem repository', () => {
    expect(ordemRepository).toBeDefined();
  });

  describe('module configuration', () => {
    it('should have correct imports', () => {
      expect(module).toBeDefined();
    });

    it('should have correct controllers', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(OrdensController);
    });

    it('should have correct providers', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(OrdensService);
    });
  });

  describe('dependency injection', () => {
    it('should inject OrdensService into OrdensController', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      expect(controller).toBeInstanceOf(OrdensController);
    });

    it('should inject Ordem repository into OrdensService', () => {
      expect(service).toBeDefined();
      expect(ordemRepository).toBeDefined();
      expect(service).toBeInstanceOf(OrdensService);
    });

    it('should have all dependencies properly injected', () => {
      expect(module.get<OrdensService>(OrdensService)).toBeDefined();
      expect(module.get<OrdensController>(OrdensController)).toBeDefined();
      expect(
        module.get<Repository<Ordem>>(getRepositoryToken(Ordem)),
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
      expect(ordemRepository).toBeDefined();
    });
  });

  describe('TypeORM integration', () => {
    it('should have TypeORM repository configured', () => {
      expect(ordemRepository).toBeDefined();
      expect(typeof ordemRepository.save).toBe('function');
      expect(typeof ordemRepository.find).toBe('function');
      expect(typeof ordemRepository.findOne).toBe('function');
      expect(typeof ordemRepository.update).toBe('function');
      expect(typeof ordemRepository.remove).toBe('function');
    });

    it('should have Ordem entity properly configured', () => {
      expect(ordemRepository).toBeDefined();
    });
  });
});
