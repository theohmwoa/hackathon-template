-- =====================================================
-- Project Files Table Schema
-- =====================================================
-- Description: Stores code files and content for each project
-- Dependencies: auth.users, public.projects
-- RLS: Users can only access files for projects they own
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.project_files (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Attributes
  file_path TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('tsx', 'css', 'html', 'json')),

  -- Timestamps (required)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one file per path per project
  UNIQUE(project_id, file_path)
);

-- Comments
COMMENT ON TABLE public.project_files IS 'Stores code files and content for WebFlow Pro projects';
COMMENT ON COLUMN public.project_files.project_id IS 'Project this file belongs to (cascading delete when project is deleted)';
COMMENT ON COLUMN public.project_files.file_path IS 'File path within project (e.g., src/App.tsx)';
COMMENT ON COLUMN public.project_files.file_content IS 'Complete file content/code';
COMMENT ON COLUMN public.project_files.file_type IS 'File type constraint: tsx, css, html, or json';

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index (critical for joins and cascading deletes)
CREATE INDEX project_files_project_id_idx ON public.project_files(project_id);

-- File path index for quick lookups
CREATE INDEX project_files_path_idx ON public.project_files(file_path);

-- File type index for filtering by type
CREATE INDEX project_files_type_idx ON public.project_files(file_type);

-- Sorting/pagination optimization
CREATE INDEX project_files_created_at_idx ON public.project_files(created_at DESC);

-- Composite index for common query pattern: files in a project sorted by creation
CREATE INDEX project_files_project_created_idx ON public.project_files(project_id, created_at DESC);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Users can view files for their own projects
-- This policy checks ownership through the projects table
CREATE POLICY "Users can view files for own projects" ON public.project_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create files for their own projects
CREATE POLICY "Users can create files for own projects" ON public.project_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update files for their own projects
CREATE POLICY "Users can update files for own projects" ON public.project_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete files for their own projects
CREATE POLICY "Users can delete files for own projects" ON public.project_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp (reuses function from projects table)
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON public.project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Project Files table created successfully';
  RAISE NOTICE '   - Table: public.project_files';
  RAISE NOTICE '   - RLS: Enabled (users can only access files for own projects)';
  RAISE NOTICE '   - Indexes: project_id, file_path, file_type, created_at, composites';
  RAISE NOTICE '   - Triggers: updated_at auto-update';
  RAISE NOTICE '   - Constraints: file_type CHECK, unique(project_id, file_path)';
END $$;
