import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordem, OrdemStatus } from './entities/ordem.entity';
import { OrdensService } from './ordens.service';

describe('OrdensService', () => {
  let service: OrdensService;
  let repository: Repository<Ordem>;

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
    criadoPor: {
      id: 'user-uuid-123',
      nome: 'Usuário Criador',
      email: 'criador@test.com',
      senha: 'hashed-password',
      role: 'agent' as any,
      ativo: true,
      refreshToken: null as string | null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ordensCriadas: [],
      ordensResponsavel: [],
    },
    responsavel: null as any,
  } as Ordem;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdensService,
        {
          provide: getRepositoryToken(Ordem),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdensService>(OrdensService);
    repository = module.get<Repository<Ordem>>(getRepositoryToken(Ordem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ordem', async () => {
      const createOrdemDto = {
        cliente: 'Novo Cliente',
        descricao: 'Nova descrição',
        criado_por_id: 'user-uuid-456',
      };

      mockRepository.save.mockResolvedValue({
        id: 'uuid-456',
        ...createOrdemDto,
        status: OrdemStatus.ABERTA,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
      });

      const result = await service.create(createOrdemDto);

      expect(mockRepository.save).toHaveBeenCalledWith(createOrdemDto);
      expect(result).toHaveProperty('id');
      expect(result.cliente).toBe(createOrdemDto.cliente);
    });

    it('should create ordem with all provided fields', async () => {
      const createOrdemDto = {
        cliente: 'Cliente Completo',
        descricao: 'Descrição completa',
        status: OrdemStatus.EM_ANDAMENTO,
        criado_por_id: 'user-uuid-789',
        responsavel_id: 'user-uuid-999',
      };

      mockRepository.save.mockResolvedValue({
        id: 'uuid-789',
        ...createOrdemDto,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
      });

      const result = await service.create(createOrdemDto);

      expect(mockRepository.save).toHaveBeenCalledWith(createOrdemDto);
      expect(result.status).toBe(OrdemStatus.EM_ANDAMENTO);
      expect(result.responsavel_id).toBe('user-uuid-999');
    });
  });

  describe('findAll', () => {
    it('should return an array of ordens', async () => {
      const ordens = [mockOrdem, { ...mockOrdem, id: 'uuid-456' }];
      mockRepository.find.mockResolvedValue(ordens);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['criadoPor', 'responsavel'],
        order: { data_criacao: 'DESC' },
      });
      expect(result).toEqual(ordens);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array if no ordens are found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should include relations in the query', async () => {
      mockRepository.find.mockResolvedValue([mockOrdem]);

      await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['criadoPor', 'responsavel'],
        order: { data_criacao: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an ordem by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrdem);

      const result = await service.findOne('uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        relations: ['criadoPor', 'responsavel'],
      });
      expect(result).toEqual(mockOrdem);
    });

    it('should throw NotFoundException if ordem not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        relations: ['criadoPor', 'responsavel'],
      });
    });

    it('should include relations in the query', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrdem);

      await service.findOne('uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        relations: ['criadoPor', 'responsavel'],
      });
    });
  });

  describe('update', () => {
    it('should update an existing ordem', async () => {
      const updateData = { cliente: 'Cliente Atualizado' };
      const updatedOrdem = { ...mockOrdem, ...updateData } as Ordem;

      mockRepository.update.mockResolvedValue(undefined);
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(updatedOrdem);

      const result = await service.update('uuid-123', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'uuid-123',
        updateData,
      );
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(updatedOrdem);
    });

    it('should update ordem status', async () => {
      const updateData = { status: OrdemStatus.EM_ANDAMENTO };
      const updatedOrdem = { ...mockOrdem, ...updateData } as Ordem;

      mockRepository.update.mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedOrdem);

      const result = await service.update('uuid-123', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'uuid-123',
        updateData,
      );
      expect(result.status).toBe(OrdemStatus.EM_ANDAMENTO);
    });

    it('should update responsavel_id', async () => {
      const updateData = { responsavel_id: 'user-uuid-999' };
      const updatedOrdem = { ...mockOrdem, ...updateData } as Ordem;

      mockRepository.update.mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedOrdem);

      const result = await service.update('uuid-123', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(
        'uuid-123',
        updateData,
      );
      expect(result.responsavel_id).toBe('user-uuid-999');
    });
  });

  describe('remove', () => {
    it('should remove an ordem permanently', async () => {
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockOrdem);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('uuid-123');

      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
      expect(mockRepository.remove).toHaveBeenCalledWith(mockOrdem);
    });

    it('should throw NotFoundException if ordem to remove not found', async () => {
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(findOneSpy).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('checkIn', () => {
    it('should check in an ordem successfully', async () => {
      const ordemAberta = { ...mockOrdem, status: OrdemStatus.ABERTA };
      const ordemEmAndamento = {
        ...ordemAberta,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: 'user-uuid-456',
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemAberta);
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(ordemEmAndamento);

      const result = await service.checkIn('uuid-123', 'user-uuid-456');

      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
      expect(updateSpy).toHaveBeenCalledWith('uuid-123', {
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: 'user-uuid-456',
        data_atualizacao: expect.any(Date),
      });
      expect(result.status).toBe(OrdemStatus.EM_ANDAMENTO);
      expect(result.responsavel_id).toBe('user-uuid-456');
    });

    it('should throw BadRequestException if ordem is already concluded', async () => {
      const ordemConcluida = { ...mockOrdem, status: OrdemStatus.CONCLUIDA };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemConcluida);

      await expect(
        service.checkIn('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw BadRequestException if ordem is cancelled', async () => {
      const ordemCancelada = { ...mockOrdem, status: OrdemStatus.CANCELADA };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemCancelada);

      await expect(
        service.checkIn('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw BadRequestException if ordem is already in progress', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
      };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemEmAndamento);

      await expect(
        service.checkIn('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('checkOut', () => {
    it('should check out an ordem successfully', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: 'user-uuid-456',
      };
      const ordemConcluida = {
        ...ordemEmAndamento,
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: new Date(),
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemEmAndamento);
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(ordemConcluida);

      const result = await service.checkOut('uuid-123', 'user-uuid-456');

      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
      expect(updateSpy).toHaveBeenCalledWith('uuid-123', {
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: expect.any(Date),
      });
      expect(result.status).toBe(OrdemStatus.CONCLUIDA);
      expect(result.data_conclusao).toBeDefined();
    });

    it('should throw BadRequestException if ordem is already concluded', async () => {
      const ordemConcluida = { ...mockOrdem, status: OrdemStatus.CONCLUIDA };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemConcluida);

      await expect(
        service.checkOut('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw BadRequestException if ordem is cancelled', async () => {
      const ordemCancelada = { ...mockOrdem, status: OrdemStatus.CANCELADA };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemCancelada);

      await expect(
        service.checkOut('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw BadRequestException if ordem is not in progress', async () => {
      const ordemAberta = { ...mockOrdem, status: OrdemStatus.ABERTA };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemAberta);

      await expect(
        service.checkOut('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(BadRequestException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw ForbiddenException if user is not the responsible', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: 'user-uuid-999',
      };
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemEmAndamento);

      await expect(
        service.checkOut('uuid-123', 'user-uuid-456'),
      ).rejects.toThrow(ForbiddenException);
      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
    });

    it('should allow check out if user is the responsible', async () => {
      const ordemEmAndamento = {
        ...mockOrdem,
        status: OrdemStatus.EM_ANDAMENTO,
        responsavel_id: 'user-uuid-456',
      };
      const ordemConcluida = {
        ...ordemEmAndamento,
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: new Date(),
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(ordemEmAndamento);
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValue(ordemConcluida);

      const result = await service.checkOut('uuid-123', 'user-uuid-456');

      expect(findOneSpy).toHaveBeenCalledWith('uuid-123');
      expect(updateSpy).toHaveBeenCalledWith('uuid-123', {
        status: OrdemStatus.CONCLUIDA,
        data_conclusao: expect.any(Date),
      });
      expect(result.status).toBe(OrdemStatus.CONCLUIDA);
      expect(result.data_conclusao).toBeDefined();
    });
  });
});
