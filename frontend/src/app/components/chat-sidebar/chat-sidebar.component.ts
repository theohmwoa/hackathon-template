import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ProjectsService } from '../../services/projects.service';
import { MessagesService } from '../../services/messages.service';
import { UiService } from '../../services/ui.service';
import { components } from '@api/types';

type Project = components['schemas']['Project'];
type Message = components['schemas']['Message'];

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-sidebar.component.html',
  styleUrls: ['./chat-sidebar.component.scss']
})
export class ChatSidebarComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  // Projects
  projects: Project[] = [];
  selectedProject: Project | null = null;
  loadingProjects = false;
  projectError: string | null = null;

  // Messages
  messages: Message[] = [];
  loadingMessages = false;
  messageError: string | null = null;

  // Input
  messageInput = '';
  sendingMessage = false;

  // Lifecycle
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private projectsService: ProjectsService,
    private messagesService: MessagesService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.loadProjects();

    // Listen for projects refresh event
    this.uiService.projectsRefresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProjects();
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all projects for the authenticated user
   */
  loadProjects(): void {
    this.loadingProjects = true;
    this.projectError = null;

    this.projectsService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingProjects = false)
      )
      .subscribe({
        next: (projects) => {
          this.projects = projects;

          // Auto-select first project if available
          if (projects.length > 0 && !this.selectedProject) {
            this.selectProject(projects[0]);
          }
        },
        error: (err) => {
          this.projectError = err.error?.message || 'Failed to load projects';
          console.error('Error loading projects:', err);
        }
      });
  }

  /**
   * Select a project and load its messages
   */
  selectProject(project: Project): void {
    this.selectedProject = project;
    this.messages = [];
    this.messageError = null;
    this.loadMessages(project.id);
  }

  /**
   * Load messages for the selected project
   */
  loadMessages(projectId: string): void {
    this.loadingMessages = true;
    this.messageError = null;

    this.messagesService.getByProject(projectId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingMessages = false)
      )
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.shouldScrollToBottom = true;
        },
        error: (err) => {
          this.messageError = err.error?.message || 'Failed to load messages';
          console.error('Error loading messages:', err);
        }
      });
  }

  /**
   * Send a new message
   */
  sendMessage(): void {
    const content = this.messageInput.trim();

    if (!content || !this.selectedProject || this.sendingMessage) {
      return;
    }

    this.sendingMessage = true;
    this.messageError = null;

    this.messagesService.create(this.selectedProject.id, { content })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.sendingMessage = false)
      )
      .subscribe({
        next: (newMessages) => {
          // API returns [userMessage, assistantMessage]
          this.messages.push(...newMessages);
          this.messageInput = '';
          this.shouldScrollToBottom = true;
        },
        error: (err) => {
          this.messageError = err.error?.message || 'Failed to send message';
          console.error('Error sending message:', err);
        }
      });
  }

  /**
   * Handle Enter key in textarea
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Scroll message container to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Track messages by ID for ngFor performance
   */
  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  /**
   * Track projects by ID for ngFor performance
   */
  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }

  /**
   * Show create project dialog
   */
  showCreateProjectDialog(): void {
    this.uiService.openCreateProjectDialog();
  }
}
