import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  async create(dto: CreatePositionDto): Promise<Position> {
    const { name, description, parentId } = dto;

    // Validate parent exists (if provided)
    if (parentId) {
      const parentExists = await this.positionRepository.findOne({
        where: { id: parentId, deletedAt: IsNull() },
      });
      if (!parentExists) {
        throw new NotFoundException(
          `Managing position with ID "${parentId}" not found.`,
        );
      }
    } else {
      // Enforce single root (CEO)
      const rootExists = await this.positionRepository.findOne({
        where: { parentId: IsNull(), deletedAt: IsNull() },
      });
      if (rootExists) {
        throw new BadRequestException(
          'A root position (CEO) already exists. Every new position must report to an existing role.',
        );
      }
    }

    const newPosition = this.positionRepository.create({
      name,
      description: description ?? null, // Handle optional field
      parentId: parentId ?? null,
    });

    return this.positionRepository.save(newPosition);
  }
  private async wouldCreateCycle(
    positionId: string,
    newParentId: string,
  ): Promise<boolean> {
    if (positionId === newParentId) return true;

    let current = await this.positionRepository.findOne({
      where: { id: newParentId, deletedAt: IsNull() },
    });

    while (current?.parentId) {
      if (current.parentId === positionId) return true;
      current = await this.positionRepository.findOne({
        where: { id: current.parentId, deletedAt: IsNull() },
      });
    }
    return false;
  }
  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);
    const { name, description, parentId } = dto;

    // Prevent self-reference
    if (parentId && parentId === id) {
      throw new BadRequestException('A position cannot report to itself.');
    }

    // Validate parent exists (if changing)
    if (parentId && parentId !== position.parentId) {
      const parentExists = await this.positionRepository.findOne({
        where: { id: parentId, deletedAt: IsNull() },
      });
      if (!parentExists) {
        throw new NotFoundException(
          `Managing position with ID "${parentId}" not found.`,
        );
      }
    }

    // Only update fields that were provided
    if (name !== undefined) position.name = name;
    if (description !== undefined) position.description = description ?? null;
    if (parentId !== undefined) position.parentId = parentId ?? null;

    return this.positionRepository.save(position);
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!position) {
      throw new NotFoundException(`Position with ID "${id}" not found.`);
    }
    return position;
  }

  async getTreeStructure(): Promise<Position[]> {
    const allPositions = await this.positionRepository.find({
      where: { deletedAt: IsNull() },
    });
    return this.buildTree(allPositions, null);
  }

  async getChildren(id: string): Promise<Position[]> {
    await this.findOne(id);
    const allPositions = await this.positionRepository.find({
      where: { deletedAt: IsNull() },
    });
    return this.buildTree(allPositions, id);
  }

  async remove(id: string): Promise<void> {
    // Prevent deleting root if it has children
    const hasChildren = await this.positionRepository.count({
      where: { parentId: id, deletedAt: IsNull() },
    });

    if (hasChildren > 0) {
      throw new BadRequestException(
        'Cannot delete position with active children. Reassign or delete children first.',
      );
    }

    await this.positionRepository.softDelete(id);
  }
  // Helper: Recursive tree builder (simple JS recursion - works for <500 positions)
  private buildTree(
    positions: Position[],
    parentId: string | null,
  ): Position[] {
    const branch: Position[] = [];

    for (const position of positions) {
      if (position.parentId === parentId) {
        const children = this.buildTree(positions, position.id);
        position.children = children;
        branch.push(position);
      }
    }

    return branch;
  }
}
