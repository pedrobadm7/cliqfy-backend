import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrdemDto } from './dto/create-order.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { Ordem, OrdemStatus } from './entities/ordem.entity';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';

// Mock dos módulos de auth antes de importar o controller
jest.mock('../auth/decorators/roles.decorator', () => ({
  Roles: () => () => {},
}));

jest.mock('../auth/decorators/current-user.decorator', () => ({
  CurrentUser: () => () => {},
}));

jest.mock('../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {},
}));

jest.mock('../auth/guards/roles.guard', () => ({
  RolesGuard: class MockRolesGuard {},
}));

describe('OrdensController', () => {
  let controller: OrdensController;
  let service: OrdensService;

  const mockUser = {
    id: 'user-uuid-123',
    nome: 'Test User',
    email: 'test@test.com',
    senha: 'hashed-password',
    role: UserRole.AGENT,
    ativo: true,
    refreshToken: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ordensCriadas: [],
    ordensResponsavel: [],
  } as User;

  const mockOrdem = {
    id: 'uuid-123',
    cliente: 'Cliente Teste',
    descricao: 'Descrição da ordem',
    status: OrdemStatus.ABERTA,
    data_criacao: new Date(),
    data_atualizacao: new Date(),
    data_conclusao: null as Date | null,
    criado_por_id: 'user-uuid-123',
    responsavel_id: null as string | null,
    criadoPor: mockUser,
    responsavel: null as any,
  } as Ordem;

  const mockOrdensService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    checkIn: jest.fn(),
    checkOut: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdensController],
      providers: [
        {
          provide: OrdensService,
          useValue: mockOrdensService,
        },
      ],
    }).compile();

    controller = module.get<OrdensController>(OrdensController);
    service = module.get<OrdensService>(OrdensService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ordem', async () => {
      const createOrdemDto: CreateOrdemDto = {
        cliente: 'Novo Cliente',
        descricao: 'Nova descrição',
        responsavel_id: 'user-uuid-456',
        criado_por_id: mockUser.id,
      };

      const expectedOrdem = {
        ...mockOrdem,
        ...createOrdemDto,
        criado_por_id: mockUser.id,
      };

      mockOrdensService.create.mockResolvedValue(expectedOrdem);

      const result = await controller.create(createOrdemDto, mockUser);

      expect(mockOrdensService.create).toHaveBeenCalledWith({
        ...createOrdemDto,
        criado_por_id: mockUser.id,
      });
      expect(result).toEqual(expectedOrdem);
    });

    it('should create ordem with minimal data', async () => {
      const createOrdemDto: CreateOrdemDto = {
        cliente: 'Cliente Simples',
        descricao: 'Descrição simples',
        criado_por_id: mockUser.id,
      };

      const expectedOrdem = {
        ...mockOrdem,
        ...createOrdemDto,
        criado_por_id: mockUser.id,
      };

      mockOrdensService.create.mockResolvedValue(expectedOrdem);

      const result = await controller.create(createOrdemDto, mockUser);

      expect(mockOrdensService.create).toHaveBeenCalledWith({
        ...createOrdemDto,
        criado_por_id: mockUser.id,
      });
      expect(result.cliente).toBe('Cliente Simples');
      expect(result.criado_por_id).toBe(mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should return an array of ordens', async () => {
      const ordens = [mockOrdem, { ...mockOrdem, id: 'uuid-456' }];
      mockOrdensService.findAll.mockResolvedValue(ordens);

      const result = await controller.findAll();

      expect(mockOrdensService.findAll).toHaveBeenCalled();
      expect(result).toEqual(ordens);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no ordens', async () => {
      mockOrdensService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an ordem by id', async () => {
      mockOrdensService.findOne.mockResolvedValue(mockOrdem);

      const result = await controller.findOne('uuid-123');

      expect(mockOrdensService.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockOrdem);
    });

    it('should call service with correct id', async () => {
      mockOrdensService.findOne.mockResolvedValue(mockOrdem);

      await controller.findOne('uuid-456');

      expect(mockOrdensService.findOne).toHaveBeenCalledWith('uuid-456');
    });
  });

  describe('update', () => {
    it('should update an ordem', async () => {
      const updateOrdemDto: UpdateOrdemDto = {
        cliente: 'Cliente Atualizado',
      };
      const updatedOrdem = { ...mockOrdem, ...updateOrdemDto };

      mockOrdensService.update.mockResolvedValue(updatedOrdem);

      const result = await controller.update('uuid-123', updateOrdemDto);

      expect(mockOrdensService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateOrdemDto,
      );
      expect(result).toEqual(updatedOrdem);
      expect(result.cliente).toBe('Cliente Atualizado');
    });

    it('should update ordem status', async () => {
      const updateOrdemDto: UpdateOrdemDto = {
        status: OrdemStatus.EM_ANDAMENTO,
      };
      const updatedOrdem = { ...mockOrdem, ...updateOrdemDto };

      mockOrdensService.update.mockResolvedValue(updatedOrdem);

      const result = await controller.update('uuid-123', updateOrdemDto);

      expect(mockOrdensService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateOrdemDto,
      );
      expect(result.status).toBe(OrdemStatus.EM_ANDAMENTO);
    });

    it('should update responsavel_id', async () => {
      const updateOrdemDto: UpdateOrdemDto = {
        responsavel_id: 'user-uuid-999',
      };
      const updatedOrdem = { ...mockOrdem, ...updateOrdemDto };

      mockOrdensService.update.mockResolvedValue(updatedOrdem);

      const result = await controller.update('uuid-123', updateOrdemDto);

      expect(mockOrdensService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateOrdemDto,
      );
      expect(result.responsavel_id).toBe('user-uuid-999');
    });
  });

  describe('remove', () => {
    it('should remove an ordem', async () => {
      mockOrdensService.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-123');

      expect(mockOrdensService.remove).toHaveBeenCalledWith('uuid-123');
    });

    it('should not return anything when removing ordem', async () => {
      mockOrdensService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-123');

      expect(result).toBeUndefined();
    });
  });

  describe('checkIn', () => {
    it('should check in an ordem', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: mockUser.id,
      };

      mockOrdensService.checkIn.mockResolvedValue(ordemEmAndamento);

      const result = await controller.checkIn('uuid-123', mockUser);

      expect(mockOrdensService.checkIn).toHaveBeenCalledWith(
        'uuid-123',
        mockUser.id,
      );
      expect(result).toEqual(ordemEmAndamento);
      expect(result.status).toBe(OrdemStatus.EM_ANDAMENTO);
      expect(result.responsavel_id).toBe(mockUser.id);
    });

    it('should call service with correct parameters', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: mockUser.id,
      };

      mockOrdensService.checkIn.mockResolvedValue(ordemEmAndamento);

      await controller.checkIn('uuid-456', mockUser);

      expect(mockOrdensService.checkIn).toHaveBeenCalledWith(
        'uuid-456',
        mockUser.id,
      );
    });
  });

  describe('checkOut', () => {
    it('should check out an ordem', async () => {
      const ordemConcluida = {
        ...mockOrdem,
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: new Date(),
        responsavel_id: mockUser.id,
      };

      mockOrdensService.checkOut.mockResolvedValue(ordemConcluida);

      const result = await controller.checkOut('uuid-123', mockUser);

      expect(mockOrdensService.checkOut).toHaveBeenCalledWith(
        'uuid-123',
        mockUser.id,
      );
      expect(result).toEqual(ordemConcluida);
      expect(result.status).toBe(OrdemStatus.CONCLUIDA);
      expect(result.data_conclusao).toBeDefined();
    });

    it('should call service with correct parameters', async () => {
      const ordemConcluida = {
        ...mockOrdem,
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: new Date(),
        responsavel_id: mockUser.id,
      };

      mockOrdensService.checkOut.mockResolvedValue(ordemConcluida);

      await controller.checkOut('uuid-456', mockUser);

      expect(mockOrdensService.checkOut).toHaveBeenCalledWith(
        'uuid-456',
        mockUser.id,
      );
    });
  });
});
