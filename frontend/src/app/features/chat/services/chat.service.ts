import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type ChatMessage = components['schemas']['ChatMessage'];
type CreateMessageDto = components['schemas']['CreateMessageDto'];

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private api: ApiService) {}

  /**
   * Get chat history for a project
   * Endpoint: GET /projects/:projectId/messages
   * Returns messages sorted by created_at ASC
   */
  getMessages(projectId: string): Observable<ChatMessage[]> {
    return this.api.get<ChatMessage[]>(`projects/${projectId}/messages`);
  }

  /**
   * Send a message to the AI assistant
   * Endpoint: POST /projects/:projectId/messages
   * Returns both user message and AI response
   */
  sendMessage(projectId: string, content: string): Observable<SendMessageResponse> {
    const data: CreateMessageDto = { content };
    return this.api.post<SendMessageResponse>(`projects/${projectId}/messages`, data);
  }
}
