import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

jest.mock('../auth/decorators/roles.decorator', () => ({
  Roles: () => () => {},
}));

jest.mock('../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {},
}));

jest.mock('../auth/guards/roles.guard', () => ({
  RolesGuard: class MockRolesGuard {},
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'uuid-123',
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

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        nome: 'New User',
        email: 'new@test.com',
        senha: '123456',
        role: UserRole.AGENT,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser, { ...mockUser, id: 'uuid-456' }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('uuid-123');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        nome: 'Updated Name',
      };
      const updatedUser = { ...mockUser, nome: 'Updated Name' };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-123', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
      expect(result.nome).toBe('Updated Name');
    });

    it('should update user email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@test.com',
      };
      const updatedUser = { ...mockUser, email: 'newemail@test.com' };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-123', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateUserDto,
      );
      expect(result.email).toBe('newemail@test.com');
    });

    it('should update user role', async () => {
      const updateUserDto: UpdateUserDto = {
        role: UserRole.ADMIN,
      };
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-123', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'uuid-123',
        updateUserDto,
      );
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-123');

      expect(mockUsersService.remove).toHaveBeenCalledWith('uuid-123');
    });

    it('should not return anything when removing user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-123');

      expect(result).toBeUndefined();
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const deactivatedUser = { ...mockUser, ativo: false };
      mockUsersService.softRemove.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivate('uuid-123');

      expect(mockUsersService.softRemove).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(deactivatedUser);
      expect(result.ativo).toBe(false);
    });

    it('should call softRemove method from service', async () => {
      const deactivatedUser = { ...mockUser, ativo: false };
      mockUsersService.softRemove.mockResolvedValue(deactivatedUser);

      await controller.deactivate('uuid-123');

      expect(mockUsersService.softRemove).toHaveBeenCalledTimes(1);
      expect(mockUsersService.softRemove).toHaveBeenCalledWith('uuid-123');
    });
  });
});
