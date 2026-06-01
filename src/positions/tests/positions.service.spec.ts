import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PositionsService } from '../positions.service';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PositionsService (Unit)', () => {
  let service: PositionsService;
  let repository: Repository<Position>;

  const mockPosition: Position = {
    id: 'test-uuid-1234',
    name: 'CEO',
    description: 'Chief Executive Officer',
    parentId: null,
    parent: null,
    children: [],
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest
      .fn()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .mockImplementation((dto) => ({ ...mockPosition, ...dto })),
    save: jest.fn().mockResolvedValue(mockPosition),
    findOne: jest.fn().mockResolvedValue(mockPosition),
    find: jest.fn().mockResolvedValue([mockPosition]),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(0),
    query: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        {
          provide: getRepositoryToken(Position),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    repository = module.get<Repository<Position>>(getRepositoryToken(Position));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a root position when no parent is provided', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null); // No root exists

      const dto: CreatePositionDto = {
        name: 'CEO',
        description: 'Chief',
        parentId: null,
      };
      const result = await service.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { parentId: IsNull(), deletedAt: IsNull() },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith({
        name: 'CEO',
        description: 'Chief',
        parentId: null,
      });
      expect(result.name).toBe('CEO');
    });

    it('should throw BadRequestException if creating second root', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockPosition); // Root exists

      const dto: CreatePositionDto = {
        name: 'Fake CEO',
        description: '',
        parentId: null,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if parent does not exist', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null) // Parent not found
        .mockResolvedValueOnce(mockPosition); // Root check

      const dto: CreatePositionDto = {
        name: 'Intern',
        description: 'Entry level',
        parentId: 'non-existent-uuid',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update position fields when provided', async () => {
      const dto: UpdatePositionDto = {
        name: 'Updated CEO',
        description: 'New desc',
      };

      const result = await service.update('test-uuid-1234', dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1234', deletedAt: IsNull() },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated CEO',
          description: 'New desc',
        }),
      );
      expect(result.name).toBe('Updated CEO');
    });

    it('should throw BadRequestException if position reports to itself', async () => {
      const dto: UpdatePositionDto = { parentId: 'test-uuid-1234' };

      await expect(service.update('test-uuid-1234', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return position if found', async () => {
      const result = await service.findOne('test-uuid-1234');

      expect(result).toEqual(mockPosition);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTreeStructure', () => {
    it('should return nested tree structure', async () => {
      const result = await service.getTreeStructure();

      expect(Array.isArray(result)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft-delete a position without children', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0); // No children

      await service.remove('test-uuid-1234');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.softDelete).toHaveBeenCalledWith('test-uuid-1234');
    });

    it('should throw BadRequestException if deleting root with children', async () => {
      // Mock root position
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ ...mockPosition, parentId: null });
      jest.spyOn(repository, 'count').mockResolvedValue(2); // Has children

      await expect(service.remove('root-with-children')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
