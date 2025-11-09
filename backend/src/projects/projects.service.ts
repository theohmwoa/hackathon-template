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

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...createProjectDto,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create project: ${error.message}`);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  async findAll(userId: string): Promise<Project[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
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
    // First verify the project exists and belongs to the user
    await this.findOne(id, userId);

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
    // First verify the project exists and belongs to the user
    await this.findOne(id, userId);

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
}
