import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ProjectFile } from './entities/file.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    projectId: string,
    createFileDto: CreateFileDto,
    userId: string,
  ): Promise<ProjectFile> {
    const supabase = this.supabaseService.getClient();

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      this.logger.error(`Project not found or access denied: ${projectId}`);
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Create file
    const { data, error } = await supabase
      .from('project_files')
      .insert({
        ...createFileDto,
        project_id: projectId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException(
          `File with path '${createFileDto.file_path}' already exists in this project`,
        );
      }
      this.logger.error(`Failed to create file: ${error.message}`);
      throw new Error(`Failed to create file: ${error.message}`);
    }

    return data;
  }

  async findAllByProject(projectId: string, userId: string): Promise<ProjectFile[]> {
    const supabase = this.supabaseService.getClient();

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      this.logger.error(`Project not found or access denied: ${projectId}`);
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(`Failed to fetch files: ${error.message}`);
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string, userId: string): Promise<ProjectFile> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('project_files')
      .select('*, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (error || !data) {
      this.logger.error(`File not found: ${id}`);
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return data;
  }

  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    userId: string,
  ): Promise<ProjectFile> {
    const supabase = this.supabaseService.getClient();

    // Verify file exists and user owns the project
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('*, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (fileError || !file) {
      this.logger.error(`File not found: ${id}`);
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Update file
    const { data, error } = await supabase
      .from('project_files')
      .update({
        file_content: updateFileDto.file_content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      const errorMsg = error ? error.message : 'Not found';
      this.logger.error(`Failed to update file: ${errorMsg}`);
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Verify file exists and user owns the project
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('*, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (fileError || !file) {
      this.logger.error(`File not found: ${id}`);
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const { error } = await supabase.from('project_files').delete().eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new NotFoundException(`File with ID ${id} not found`);
    }
  }
}
