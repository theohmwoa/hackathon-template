import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { PreviewPanelComponent } from '../../components/preview-panel/preview-panel.component';
import { ProjectCreateDialogComponent } from '../../components/project-create-dialog/project-create-dialog.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { UiService } from '../../services/ui.service';
import { components } from '@api/types';

type Project = components['schemas']['Project'];

@Component({
  selector: 'app-main-app',
  standalone: true,
  imports: [
    CommonModule,
    ChatSidebarComponent,
    PreviewPanelComponent,
    ProjectCreateDialogComponent
  ],
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit, OnDestroy {
  showCreateProjectDialog = false;
  currentUser: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private supabaseService: SupabaseService,
    private uiService: UiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Subscribe to dialog state
    this.uiService.showCreateProjectDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showCreateProjectDialog = show;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Close create project dialog
   */
  closeCreateProjectDialog(): void {
    this.uiService.closeCreateProjectDialog();
  }

  /**
   * Handle project created event
   */
  onProjectCreated(project: Project): void {
    console.log('Project created:', project);
    // Trigger projects refresh in sidebar
    this.uiService.refreshProjects();
  }

  /**
   * Handle logout
   */
  async logout(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get user email or default text
   */
  getUserEmail(): string {
    return this.currentUser?.email || 'User';
  }
}
