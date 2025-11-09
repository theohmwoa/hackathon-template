import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type Project = components['schemas']['Project'];
type CreateProjectDto = components['schemas']['CreateProjectDto'];
type UpdateProjectDto = components['schemas']['UpdateProjectDto'];

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly endpoint = 'projects';

  constructor(private api: ApiService) {}

  /**
   * Get all projects for the authenticated user
   * Endpoint: GET /projects
   * Returns projects sorted by creation date (newest first)
   */
  getAll(): Observable<Project[]> {
    return this.api.get<Project[]>(this.endpoint);
  }

  /**
   * Get a single project by ID
   * Endpoint: GET /projects/:id
   * Verifies user owns the project
   */
  getById(id: string): Observable<Project> {
    return this.api.get<Project>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new project
   * Endpoint: POST /projects
   * User ID is extracted from JWT token automatically
   */
  create(data: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>(this.endpoint, data);
  }

  /**
   * Update an existing project
   * Endpoint: PATCH /projects/:id
   * Verifies user owns the project
   */
  update(id: string, data: UpdateProjectDto): Observable<Project> {
    return this.api.patch<Project>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a project and all associated messages
   * Endpoint: DELETE /projects/:id
   * Verifies user owns the project
   * Cascading delete removes all messages
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
