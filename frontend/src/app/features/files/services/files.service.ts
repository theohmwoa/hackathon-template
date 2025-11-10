import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type ProjectFile = components['schemas']['ProjectFile'];
type CreateFileDto = components['schemas']['CreateFileDto'];
type UpdateFileDto = components['schemas']['UpdateFileDto'];

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(private api: ApiService) {}

  /**
   * Get all files in a project
   * Endpoint: GET /projects/:projectId/files
   * Returns files sorted by created_at ASC
   */
  getAll(projectId: string): Observable<ProjectFile[]> {
    return this.api.get<ProjectFile[]>(`projects/${projectId}/files`);
  }

  /**
   * Get a single file by ID
   * Endpoint: GET /files/:id
   */
  getById(id: string): Observable<ProjectFile> {
    return this.api.get<ProjectFile>(`files/${id}`);
  }

  /**
   * Create a new file in project
   * Endpoint: POST /projects/:projectId/files
   */
  create(projectId: string, data: CreateFileDto): Observable<ProjectFile> {
    return this.api.post<ProjectFile>(`projects/${projectId}/files`, data);
  }

  /**
   * Update file content
   * Endpoint: PATCH /files/:id
   */
  update(id: string, data: UpdateFileDto): Observable<ProjectFile> {
    return this.api.patch<ProjectFile>(`files/${id}`, data);
  }

  /**
   * Delete a file
   * Endpoint: DELETE /files/:id
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`files/${id}`);
  }
}
