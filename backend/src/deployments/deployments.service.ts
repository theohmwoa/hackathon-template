import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Deployment } from './entities/deployment.entity';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async deploy(projectId: string, userId: string): Promise<Deployment> {
    const supabase = this.supabaseService.getClient();

    // Verify project ownership and get project name
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      this.logger.error(`Project not found or access denied: ${projectId}`);
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Create deployment with pending status
    const { data: deployment, error } = await supabase
      .from('deployments')
      .insert({
        project_id: projectId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create deployment: ${error.message}`);
      throw new Error(`Failed to create deployment: ${error.message}`);
    }

    // Start mock deployment process in background
    this.startMockDeployment(deployment.id, project.name);

    return deployment;
  }

  async findAllByProject(projectId: string, userId: string): Promise<Deployment[]> {
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
      .from('deployments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch deployments: ${error.message}`);
      throw new Error(`Failed to fetch deployments: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string, userId: string): Promise<Deployment> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('deployments')
      .select('*, projects!inner(user_id)')
      .eq('id', id)
      .eq('projects.user_id', userId)
      .single();

    if (error || !data) {
      this.logger.error(`Deployment not found: ${id}`);
      throw new NotFoundException(`Deployment with ID ${id} not found`);
    }

    return data;
  }

  async getLogs(id: string, userId: string): Promise<{ logs: string }> {
    const deployment = await this.findOne(id, userId);
    return { logs: deployment.build_log || 'No logs available yet.' };
  }

  private async startMockDeployment(deploymentId: string, projectName: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    // Generate random 6-char ID for deployment URL
    const randomId = Math.random().toString(36).substring(2, 8);
    const slugifiedName = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const deploymentUrl = `https://${slugifiedName}-${randomId}.webflowpro.app`;

    try {
      // Pending -> Building (after 2 seconds)
      setTimeout(async () => {
        await supabase
          .from('deployments')
          .update({
            status: 'building',
            build_log: 'Installing dependencies...\n',
            updated_at: new Date().toISOString(),
          })
          .eq('id', deploymentId);
      }, 2000);

      // Building -> Deploying (after 5 seconds total)
      setTimeout(async () => {
        await supabase
          .from('deployments')
          .update({
            status: 'deploying',
            build_log: `Installing dependencies...
✓ Dependencies installed (234 packages)

Building project...
✓ TypeScript compilation successful
✓ Assets optimized
`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deploymentId);
      }, 5000);

      // Deploying -> Success (after 7 seconds total)
      setTimeout(async () => {
        const finalLogs = `Installing dependencies...
✓ Dependencies installed (234 packages)

Building project...
✓ TypeScript compilation successful
✓ Assets optimized

Deploying to CDN...
✓ Files uploaded
✓ DNS configured

Deployment successful!
Your site is live at ${deploymentUrl}`;

        await supabase
          .from('deployments')
          .update({
            status: 'success',
            deployment_url: deploymentUrl,
            build_log: finalLogs,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deploymentId);

        // Update project with deployment info
        const { data: deployment } = await supabase
          .from('deployments')
          .select('project_id')
          .eq('id', deploymentId)
          .single();

        if (deployment) {
          await supabase
            .from('projects')
            .update({
              is_deployed: true,
              deployment_url: deploymentUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', deployment.project_id);
        }
      }, 7000);
    } catch (error) {
      this.logger.error(`Mock deployment error: ${error}`);
    }
  }
}
