import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({
    example: 'CTO',
    description: 'Name of the employee position',
  })
  @IsNotEmpty({ message: 'Position name is required' })
  @IsString({ message: 'Position name must be a string' })
  @MaxLength(255, { message: 'Position name cannot exceed 255 characters' })
  name!: string;

  @ApiProperty({
    example: 'Manages technology department',
    description: 'Brief position overview',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string; // ✅ Already optional with ?

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'GUID ID of the managing boss role',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'parentId must be a valid UUID v4' })
  parentId?: string | null;
}
