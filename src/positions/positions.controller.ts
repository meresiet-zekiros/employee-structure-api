import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Delete,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@ApiTags('Positions Hierarchy Manager')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @HttpCode(201)
  create(@Body() createDto: CreatePositionDto) {
    return this.positionsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing position' })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updateDto);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get full hierarchy tree' })
  getTree() {
    return this.positionsService.getTreeStructure();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position details' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.positionsService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct children of a position' })
  getChildren(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.positionsService.getChildren(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a position' })
  @ApiResponse({ status: 204, description: 'Position deleted successfully' })
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.positionsService.remove(id);
  }
}
