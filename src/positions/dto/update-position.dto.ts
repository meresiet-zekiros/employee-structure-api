import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePositionDto {
  @ApiPropertyOptional({
    example: 'Chief Technology Officer',
    description: 'Updated name of the position',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated tech department description',
    description: 'Updated brief position overview',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'GUID ID of the new managing boss role',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'parentId must be a valid UUID v4' })
  parentId?: string | null;
}
