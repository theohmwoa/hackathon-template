import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type Message = components['schemas']['Message'];
type CreateMessageDto = components['schemas']['CreateMessageDto'];
type UpdateMessageDto = components['schemas']['UpdateMessageDto'];

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly endpoint = 'messages';

  constructor(private api: ApiService) {}

  /**
   * Create a new user message and get mock AI response
   * Endpoint: POST /messages/projects/:projectId
   * Returns an array with TWO messages:
   * - [0]: User's message (role: "user")
   * - [1]: Mock assistant response (role: "assistant")
   */
  create(projectId: string, data: CreateMessageDto): Observable<Message[]> {
    return this.api.post<Message[]>(`${this.endpoint}/projects/${projectId}`, data);
  }

  /**
   * Get all messages for a project
   * Endpoint: GET /messages/projects/:projectId
   * Returns messages in chronological order (oldest first)
   * Verifies user owns the project
   */
  getByProject(projectId: string): Observable<Message[]> {
    return this.api.get<Message[]>(`${this.endpoint}/projects/${projectId}`);
  }

  /**
   * Get a single message by ID
   * Endpoint: GET /messages/:id
   * Verifies user owns the message's project
   */
  getById(id: string): Observable<Message> {
    return this.api.get<Message>(`${this.endpoint}/${id}`);
  }

  /**
   * Update a message's content
   * Endpoint: PATCH /messages/:id
   * Verifies user owns the message's project
   */
  update(id: string, data: UpdateMessageDto): Observable<Message> {
    return this.api.patch<Message>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a message
   * Endpoint: DELETE /messages/:id
   * Verifies user owns the message's project
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
