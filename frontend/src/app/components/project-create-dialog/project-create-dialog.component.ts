import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { components } from '@api/types';

type Project = components['schemas']['Project'];

@Component({
  selector: 'app-project-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-create-dialog.component.html',
  styleUrls: ['./project-create-dialog.component.scss']
})
export class ProjectCreateDialogComponent implements OnInit {
  @Output() projectCreated = new EventEmitter<Project>();
  @Output() dialogClosed = new EventEmitter<void>();

  projectForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize the project form
   */
  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['']
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting) {
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formData = this.projectForm.value;

    this.projectsService.create(formData).subscribe({
      next: (project) => {
        this.isSubmitting = false;
        this.projectCreated.emit(project);
        this.closeDialog();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to create project';
        console.error('Error creating project:', err);
      }
    });
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.dialogClosed.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  /**
   * Handle escape key
   */
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  // Form field getters
  get name() {
    return this.projectForm.get('name');
  }

  get description() {
    return this.projectForm.get('description');
  }
}
