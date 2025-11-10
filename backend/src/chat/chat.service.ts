import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatMessage } from './entities/message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async sendMessage(
    projectId: string,
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    const supabase = this.supabaseService.getClient();

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      this.logger.error(`Project not found or access denied: ${projectId}`);
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('chat_messages')
      .insert({
        project_id: projectId,
        role: 'user',
        content: createMessageDto.content,
      })
      .select()
      .single();

    if (userError) {
      this.logger.error(`Failed to save user message: ${userError.message}`);
      throw new Error(`Failed to save user message: ${userError.message}`);
    }

    // Generate mock AI response
    const aiResponse = this.generateMockAIResponse(createMessageDto.content);

    // Save assistant message
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('chat_messages')
      .insert({
        project_id: projectId,
        role: 'assistant',
        content: aiResponse,
      })
      .select()
      .single();

    if (assistantError) {
      this.logger.error(`Failed to save assistant message: ${assistantError.message}`);
      throw new Error(`Failed to save assistant message: ${assistantError.message}`);
    }

    return { userMessage, assistantMessage };
  }

  async findAllByProject(projectId: string, userId: string): Promise<ChatMessage[]> {
    const supabase = this.supabaseService.getClient();

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      this.logger.error(`Project not found or access denied: ${projectId}`);
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch messages: ${error.message}`);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data || [];
  }

  private generateMockAIResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('button')) {
      return "I've added a button component to your App.tsx file. The button uses our design system with the primary blue color.";
    }

    if (lowerMessage.includes('navbar') || lowerMessage.includes('navigation')) {
      return "I've created a responsive navigation bar with your brand colors. It includes mobile menu support.";
    }

    if (lowerMessage.includes('deploy') || lowerMessage.includes('deployment')) {
      return 'To deploy your project, click the Deploy button in the top right corner.';
    }

    // Default response
    const preview = userMessage.substring(0, 50);
    return `I understand you want to ${preview}. Let me help you build that component.`;
  }
}
