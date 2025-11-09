import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private showCreateProjectDialogSubject = new BehaviorSubject<boolean>(false);
  public showCreateProjectDialog$: Observable<boolean> = this.showCreateProjectDialogSubject.asObservable();

  private projectsRefreshSubject = new BehaviorSubject<void>(undefined);
  public projectsRefresh$: Observable<void> = this.projectsRefreshSubject.asObservable();

  /**
   * Open the create project dialog
   */
  openCreateProjectDialog(): void {
    this.showCreateProjectDialogSubject.next(true);
  }

  /**
   * Close the create project dialog
   */
  closeCreateProjectDialog(): void {
    this.showCreateProjectDialogSubject.next(false);
  }

  /**
   * Trigger projects refresh
   */
  refreshProjects(): void {
    this.projectsRefreshSubject.next();
  }
}
