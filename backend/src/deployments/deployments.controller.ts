import {
  Controller,
  Get,
  Post,
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
import { DeploymentsService } from './deployments.service';
import { Deployment } from './entities/deployment.entity';

@ApiTags('Deployments')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Post('projects/:projectId/deploy')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger new deployment' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Deployment created with pending status',
    type: Deployment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  deploy(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<Deployment> {
    return this.deploymentsService.deploy(projectId, user.id);
  }

  @Get('projects/:projectId/deployments')
  @ApiOperation({ summary: 'Get deployment history for project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Deployment history sorted by created_at DESC',
    type: [Deployment],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<Deployment[]> {
    return this.deploymentsService.findAllByProject(projectId, user.id);
  }

  @Get('deployments/:id')
  @ApiOperation({ summary: 'Get deployment status' })
  @ApiParam({
    name: 'id',
    description: 'Deployment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Deployment found',
    type: Deployment,
  })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @CurrentUser() user: User): Promise<Deployment> {
    return this.deploymentsService.findOne(id, user.id);
  }

  @Get('deployments/:id/logs')
  @ApiOperation({ summary: 'Get build logs for deployment' })
  @ApiParam({
    name: 'id',
    description: 'Deployment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Build logs retrieved',
    schema: {
      type: 'object',
      properties: {
        logs: { type: 'string', example: 'Installing dependencies...\n✓ Dependencies installed' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Deployment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLogs(@Param('id') id: string, @CurrentUser() user: User): Promise<{ logs: string }> {
    return this.deploymentsService.getLogs(id, user.id);
  }
}
