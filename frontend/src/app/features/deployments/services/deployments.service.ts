import { Injectable } from '@angular/core';
import { Observable, interval, switchMap, takeWhile, startWith } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
import { components } from '@api/types';

// Extract types from generated OpenAPI schema
type Deployment = components['schemas']['Deployment'];

export interface DeploymentLogs {
  logs: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeploymentsService {
  constructor(private api: ApiService) {}

  /**
   * Get deployment history for a project
   * Endpoint: GET /projects/:projectId/deployments
   * Returns deployments sorted by created_at DESC
   */
  getAll(projectId: string): Observable<Deployment[]> {
    return this.api.get<Deployment[]>(`projects/${projectId}/deployments`);
  }

  /**
   * Trigger a new deployment
   * Endpoint: POST /projects/:projectId/deploy
   * Returns deployment with 'pending' status
   */
  deploy(projectId: string): Observable<Deployment> {
    return this.api.post<Deployment>(`projects/${projectId}/deploy`, {});
  }

  /**
   * Get deployment status
   * Endpoint: GET /deployments/:id
   */
  getById(id: string): Observable<Deployment> {
    return this.api.get<Deployment>(`deployments/${id}`);
  }

  /**
   * Get build logs for a deployment
   * Endpoint: GET /deployments/:id/logs
   */
  getLogs(id: string): Observable<DeploymentLogs> {
    return this.api.get<DeploymentLogs>(`deployments/${id}/logs`);
  }

  /**
   * Poll deployment status until completion
   * Polls every 2 seconds until status is 'success' or 'failed'
   * @param id - Deployment ID
   * @returns Observable that emits deployment updates
   */
  pollDeploymentStatus(id: string): Observable<Deployment> {
    return interval(2000).pipe(
      startWith(0), // Emit immediately
      switchMap(() => this.getById(id)),
      takeWhile((deployment) => {
        return deployment.status !== 'success' && deployment.status !== 'failed';
      }, true) // Include final emission
    );
  }
}
