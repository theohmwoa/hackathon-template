import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProjectsService } from '@app/features/projects/services/projects.service';
import { SupabaseService } from '@app/core/services/supabase.service';
import { components } from '@api/types';

type Project = components['schemas']['Project'];
type CreateProjectDto = components['schemas']['CreateProjectDto'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  loading = false;
  error: string | null = null;
  showNewProjectModal = false;

  // New project form
  newProject: CreateProjectDto = {
    name: '',
    description: '',
    framework: 'react',
    template: 'blank'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private projectsService: ProjectsService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;

    this.projectsService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load projects';
          this.loading = false;
        }
      });
  }

  openNewProjectModal(): void {
    this.showNewProjectModal = true;
  }

  closeNewProjectModal(): void {
    this.showNewProjectModal = false;
    this.resetNewProjectForm();
  }

  resetNewProjectForm(): void {
    this.newProject = {
      name: '',
      description: '',
      framework: 'react',
      template: 'blank'
    };
  }

  createProject(): void {
    if (!this.newProject.name) {
      return;
    }

    this.loading = true;

    this.projectsService.create(this.newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.loading = false;
          this.closeNewProjectModal();
          this.router.navigate(['/editor', project.id]);
        },
        error: (err) => {
          this.error = err.message || 'Failed to create project';
          this.loading = false;
        }
      });
  }

  openProject(project: Project): void {
    // Mark as opened
    this.projectsService.markAsOpened(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.router.navigate(['/editor', project.id]);
  }

  deleteProject(project: Project, event: Event): void {
    event.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    this.projectsService.delete(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== project.id);
        },
        error: (err) => {
          this.error = err.message || 'Failed to delete project';
        }
      });
  }

  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }

  getTimeAgo(date: string | null): string {
    if (!date) return 'Never opened';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}
