-- =====================================================
-- Deployments Table Schema
-- =====================================================
-- Description: Tracks deployment history and status for projects
-- Dependencies: auth.users, public.projects
-- RLS: Users can only access deployments for projects they own
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.deployments (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Attributes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed')),
  deployment_url TEXT,
  build_log TEXT,

  -- Timestamps (required)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.deployments IS 'Tracks deployment history and status for WebFlow Pro projects';
COMMENT ON COLUMN public.deployments.project_id IS 'Project this deployment belongs to (cascading delete when project is deleted)';
COMMENT ON COLUMN public.deployments.status IS 'Deployment status: pending, building, deploying, success, or failed';
COMMENT ON COLUMN public.deployments.deployment_url IS 'Live URL of deployed project (only set when status is success)';
COMMENT ON COLUMN public.deployments.build_log IS 'Build and deployment logs for debugging';

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index (critical for joins and cascading deletes)
CREATE INDEX deployments_project_id_idx ON public.deployments(project_id);

-- Status index for filtering by deployment status
CREATE INDEX deployments_status_idx ON public.deployments(status);

-- Sorting/pagination optimization (most recent deployments first)
CREATE INDEX deployments_created_at_idx ON public.deployments(created_at DESC);

-- Composite index for common query pattern: project deployments sorted by creation
CREATE INDEX deployments_project_created_idx ON public.deployments(project_id, created_at DESC);

-- Composite index for finding active/recent deployments by status and time
CREATE INDEX deployments_status_created_idx ON public.deployments(status, created_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Users can view deployments for their own projects
-- This policy checks ownership through the projects table
CREATE POLICY "Users can view deployments for own projects" ON public.deployments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create deployments for their own projects
CREATE POLICY "Users can create deployments for own projects" ON public.deployments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update deployments for their own projects
CREATE POLICY "Users can update deployments for own projects" ON public.deployments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete deployments for their own projects
CREATE POLICY "Users can delete deployments for own projects" ON public.deployments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp (reuses function from projects table)
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Deployments table created successfully';
  RAISE NOTICE '   - Table: public.deployments';
  RAISE NOTICE '   - RLS: Enabled (users can only access deployments for own projects)';
  RAISE NOTICE '   - Indexes: project_id, status, created_at, composites';
  RAISE NOTICE '   - Triggers: updated_at auto-update';
  RAISE NOTICE '   - Constraints: status CHECK (pending, building, deploying, success, failed)';
END $$;
