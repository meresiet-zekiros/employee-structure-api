import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from '../positions.controller';
import { PositionsService } from '../positions.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { Position } from '../entities/position.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PositionsController (Unit)', () => {
  let controller: PositionsController;
  let service: PositionsService;

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

  const mockPositionsService = {
    create: jest.fn().mockResolvedValue(mockPosition),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockPosition, name: 'Updated CEO' }),
    findOne: jest.fn().mockResolvedValue(mockPosition),
    getTreeStructure: jest.fn().mockResolvedValue([mockPosition]),
    getChildren: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [
        {
          provide: PositionsService,
          useValue: mockPositionsService,
        },
      ],
    }).compile();

    controller = module.get<PositionsController>(PositionsController);
    service = module.get<PositionsService>(PositionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new position', async () => {
      const dto: CreatePositionDto = {
        name: 'CTO',
        description: 'Chief Technology Officer',
        parentId: null,
      };

      const result = await controller.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPosition);
    });
  });

  describe('update', () => {
    it('should update an existing position', async () => {
      const dto: UpdatePositionDto = { name: 'Updated CTO' };
      const id = 'test-uuid-1234';

      const result = await controller.update(id, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result.name).toBe('Updated CEO');
    });
  });

  describe('findOne', () => {
    it('should return a position by ID', async () => {
      const id = 'test-uuid-1234';
      const result = await controller.findOne(id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPosition);
    });

    it('should throw NotFoundException if position not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTree', () => {
    it('should return the full hierarchy tree', async () => {
      const result = await controller.getTree();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getTreeStructure).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockPosition);
    });
  });

  describe('getChildren', () => {
    it('should return direct children of a position', async () => {
      const id = 'test-uuid-1234';
      const result = await controller.getChildren(id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getChildren).toHaveBeenCalledWith(id);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete a position', async () => {
      const id = 'test-uuid-1234';
      await controller.remove(id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw BadRequestException if deleting root with children', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.remove('root-with-children')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
