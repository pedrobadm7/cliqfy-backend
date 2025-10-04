import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

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

  const mockRepository = {
    create: jest.fn(),
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      nome: 'New User',
      email: 'new@test.com',
      senha: '123456',
      role: UserRole.AGENT,
    };

    it('should create a new user with hashed password', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.senha, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        senha: 'hashed-password',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email já cadastrado',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users ordered by createdAt DESC', async () => {
      const users = [mockUser, { ...mockUser, id: 'uuid-456' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('uuid-999')).rejects.toThrow(
        'Usuário #uuid-999 não encontrado',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email with sensitive fields', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        select: ['id', 'nome', 'email', 'senha', 'role', 'ativo'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      nome: 'Updated Name',
    };

    it('should update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-123', updateUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.nome).toBe(updateUserDto.nome);
    });

    it('should throw ConflictException if new email already exists', async () => {
      const updateWithEmail: UpdateUserDto = {
        email: 'existing@test.com',
      };
      const anotherUser = {
        ...mockUser,
        id: 'uuid-456',
        email: 'existing@test.com',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(anotherUser);

      await expect(service.update('uuid-123', updateWithEmail)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update('uuid-123', updateWithEmail)).rejects.toThrow(
        'Email já cadastrado',
      );
    });

    it('should allow updating to same email', async () => {
      const updateWithSameEmail: UpdateUserDto = {
        email: mockUser.email,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.update('uuid-123', updateWithSameEmail);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      await service.remove('uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softRemove', () => {
    it('should deactivate a user', async () => {
      const deactivatedUser = { ...mockUser, ativo: false };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(deactivatedUser);

      const result = await service.softRemove('uuid-123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.ativo).toBe(false);
    });

    it('should throw NotFoundException if user to deactivate not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.softRemove('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
