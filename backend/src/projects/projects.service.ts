import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    const supabase = this.supabaseService.getClient();

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...createProjectDto,
        user_id: userId,
        framework: createProjectDto.framework || 'react',
        template: createProjectDto.template || 'blank',
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    // Auto-generate starter files for 'blank' template
    if (createProjectDto.template === 'blank' || !createProjectDto.template) {
      const starterFiles = [
        {
          project_id: project.id,
          file_path: 'App.tsx',
          file_content: 'export default function App() { return <div>Hello World</div> }',
          file_type: 'tsx',
        },
        {
          project_id: project.id,
          file_path: 'index.html',
          file_content:
            '<!DOCTYPE html><html><head><title>My App</title></head><body><div id="root"></div></body></html>',
          file_type: 'html',
        },
        {
          project_id: project.id,
          file_path: 'styles.css',
          file_content: 'body { margin: 0; font-family: sans-serif; }',
          file_type: 'css',
        },
      ];

      const { error: filesError } = await supabase
        .from('project_files')
        .insert(starterFiles);

      if (filesError) {
        this.logger.error(`Failed to create starter files: ${filesError.message}`);
        // Don't throw - project is created, just log the error
      }
    }

    return project;
  }

  async findAll(userId: string): Promise<Project[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('last_opened_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch projects: ${error.message}`);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      this.logger.error(`Project not found: ${id}`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return data;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updateProjectDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      this.logger.error(
        `Failed to update project: ${error?.message || 'Not found'}`,
      );
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Failed to delete project: ${error.message}`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async updateLastOpened(id: string, userId: string): Promise<Project> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('projects')
      .update({
        last_opened_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to update last_opened_at: ${error?.message || 'Not found'}`);
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return data;
  }
}
