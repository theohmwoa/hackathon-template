import {
  Controller,
  Get,
  Post,
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
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatMessage } from './entities/message.entity';

@ApiTags('Chat')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('projects/:projectId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message to AI assistant' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent and AI response received',
    schema: {
      type: 'object',
      properties: {
        userMessage: { $ref: '#/components/schemas/ChatMessage' },
        assistantMessage: { $ref: '#/components/schemas/ChatMessage' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  sendMessage(
    @Param('projectId') projectId: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    return this.chatService.sendMessage(projectId, createMessageDto, user.id);
  }

  @Get('projects/:projectId/messages')
  @ApiOperation({ summary: 'Get chat history for project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat history sorted by created_at ASC',
    type: [ChatMessage],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<ChatMessage[]> {
    return this.chatService.findAllByProject(projectId, user.id);
  }
}
