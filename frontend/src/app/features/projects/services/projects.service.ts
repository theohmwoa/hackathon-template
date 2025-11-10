import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
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
   * Get all user projects
   * Endpoint: GET /projects
   * Returns projects sorted by last_opened_at DESC
   */
  getAll(): Observable<Project[]> {
    return this.api.get<Project[]>(this.endpoint);
  }

  /**
   * Get a single project by ID
   * Endpoint: GET /projects/:id
   */
  getById(id: string): Observable<Project> {
    return this.api.get<Project>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new project with starter files
   * Endpoint: POST /projects
   */
  create(data: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>(this.endpoint, data);
  }

  /**
   * Update an existing project
   * Endpoint: PATCH /projects/:id
   */
  update(id: string, data: UpdateProjectDto): Observable<Project> {
    return this.api.patch<Project>(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete a project and all associated data
   * Endpoint: DELETE /projects/:id
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Update last_opened_at timestamp
   * Endpoint: PATCH /projects/:id/open
   */
  markAsOpened(id: string): Observable<Project> {
    return this.api.patch<Project>(`${this.endpoint}/${id}/open`, {});
  }
}
