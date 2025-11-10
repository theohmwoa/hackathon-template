import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@supabase/supabase-js';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ProjectFile } from './entities/file.entity';

@ApiTags('Files')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('projects/:projectId/files')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new file in project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully created',
    type: ProjectFile,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or file already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  create(
    @Param('projectId') projectId: string,
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() user: User,
  ): Promise<ProjectFile> {
    return this.filesService.create(projectId, createFileDto, user.id);
  }

  @Get('projects/:projectId/files')
  @ApiOperation({ summary: 'Get all files in project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of project files sorted by created_at ASC',
    type: [ProjectFile],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<ProjectFile[]> {
    return this.filesService.findAllByProject(projectId, user.id);
  }

  @Get('files/:id')
  @ApiOperation({ summary: 'Get a single file by ID' })
  @ApiParam({
    name: 'id',
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'File found',
    type: ProjectFile,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser() user: User): Promise<ProjectFile> {
    return this.filesService.findOne(id, user.id);
  }

  @Patch('files/:id')
  @ApiOperation({ summary: 'Update file content' })
  @ApiParam({
    name: 'id',
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'File successfully updated',
    type: ProjectFile,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @CurrentUser() user: User,
  ): Promise<ProjectFile> {
    return this.filesService.update(id, updateFileDto, user.id);
  }

  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({
    name: 'id',
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'File successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.filesService.remove(id, user.id);
  }
}
