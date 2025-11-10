import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type Message = components['schemas']['ChatMessage'];
type CreateMessageDto = components['schemas']['CreateMessageDto'];

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly endpoint = 'messages';

  constructor(private api: ApiService) {}

  /**
   * Create a new user message and get mock AI response
   * Endpoint: POST /projects/:projectId/messages
   * Returns an array with TWO messages:
   * - [0]: User's message (role: "user")
   * - [1]: Mock assistant response (role: "assistant")
   */
  create(projectId: string, data: CreateMessageDto): Observable<Message[]> {
    return this.api.post<Message[]>(`projects/${projectId}/${this.endpoint}`, data);
  }

  /**
   * Get all messages for a project
   * Endpoint: GET /projects/:projectId/messages
   * Returns messages in chronological order (oldest first)
   * Verifies user owns the project
   */
  getByProject(projectId: string): Observable<Message[]> {
    return this.api.get<Message[]>(`projects/${projectId}/${this.endpoint}`);
  }

  /**
   * Get a single message by ID
   * Endpoint: GET /messages/:id
   * Verifies user owns the message's project
   */
  getById(id: string): Observable<Message> {
    return this.api.get<Message>(`${this.endpoint}/${id}`);
  }

}
