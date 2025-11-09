import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    projectId: string,
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message[]> {
    // First verify the project exists and belongs to the user
    await this.projectsService.findOne(projectId, userId);

    const supabase = this.supabaseService.getClient();

    // 1. Save the user's message
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        user_id: userId,
        content: createMessageDto.content,
        role: 'user',
      })
      .select()
      .single();

    if (userError) {
      this.logger.error(`Failed to create user message: ${userError.message}`);
      throw new Error(`Failed to create message: ${userError.message}`);
    }

    // 2. Create mock assistant response
    const mockResponse = `This is a mock response to: ${createMessageDto.content}`;

    const { data: assistantMessage, error: assistantError } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        user_id: userId,
        content: mockResponse,
        role: 'assistant',
      })
      .select()
      .single();

    if (assistantError) {
      this.logger.error(
        `Failed to create assistant message: ${assistantError.message}`,
      );
      throw new Error(`Failed to create assistant message: ${assistantError.message}`);
    }

    // 3. Return both messages (user + assistant)
    return [userMessage, assistantMessage];
  }

  async findAllByProject(
    projectId: string,
    userId: string,
  ): Promise<Message[]> {
    // First verify the project exists and belongs to the user
    await this.projectsService.findOne(projectId, userId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch messages: ${error.message}`);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string, userId: string): Promise<Message> {
    const supabase = this.supabaseService.getClient();

    // Get the message
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !message) {
      this.logger.error(`Message not found: ${id}`);
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Verify the user owns the project this message belongs to
    await this.projectsService.findOne(message.project_id, userId);

    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
  ): Promise<Message> {
    // First verify the message exists and user has access
    const message = await this.findOne(id, userId);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('messages')
      .update({
        ...updateMessageDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      this.logger.error(
        `Failed to update message: ${error?.message || 'Not found'}`,
      );
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string, userId: string): Promise<void> {
    // First verify the message exists and user has access
    await this.findOne(id, userId);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('messages').delete().eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete message: ${error.message}`);
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
