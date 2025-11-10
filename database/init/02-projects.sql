-- =====================================================
-- Projects Table Schema
-- =====================================================
-- Description: Stores user projects for the chat application
-- Dependencies: auth.users (Supabase Auth)
-- RLS: Users can only access their own projects
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.projects (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Attributes
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT DEFAULT 'react' CHECK (framework IN ('react', 'vue', 'angular')),
  template TEXT DEFAULT 'blank',
  thumbnail_url TEXT,
  is_deployed BOOLEAN DEFAULT false,
  deployment_url TEXT,
  last_opened_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps (required)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.projects IS 'Stores user projects for WebFlow Pro, an AI-powered web development platform';
COMMENT ON COLUMN public.projects.user_id IS 'Owner of the project (references Supabase auth.users)';
COMMENT ON COLUMN public.projects.name IS 'Project name (required)';
COMMENT ON COLUMN public.projects.description IS 'Optional project description';
COMMENT ON COLUMN public.projects.framework IS 'Web framework: react, vue, or angular (default: react)';
COMMENT ON COLUMN public.projects.template IS 'Template used to create the project (e.g., blank, nextjs, vite)';
COMMENT ON COLUMN public.projects.thumbnail_url IS 'Project screenshot/thumbnail URL';
COMMENT ON COLUMN public.projects.is_deployed IS 'Whether the project has been deployed';
COMMENT ON COLUMN public.projects.deployment_url IS 'Live URL of the deployed project';
COMMENT ON COLUMN public.projects.last_opened_at IS 'Timestamp of when the project was last opened (for recent projects sorting)';

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index (critical for joins and cascading deletes)
CREATE INDEX projects_user_id_idx ON public.projects(user_id);

-- Sorting/pagination optimization (most recent projects first)
CREATE INDEX projects_created_at_idx ON public.projects(created_at DESC);

-- Index for last_opened_at (for recent projects sorting)
CREATE INDEX projects_last_opened_idx ON public.projects(last_opened_at DESC NULLS LAST);

-- Framework filtering index
CREATE INDEX projects_framework_idx ON public.projects(framework);

-- Deployment status index
CREATE INDEX projects_is_deployed_idx ON public.projects(is_deployed);

-- Composite index for user-specific queries with sorting
CREATE INDEX projects_user_created_idx ON public.projects(user_id, created_at DESC);

-- Composite index for user's recent projects (combines user_id and last_opened_at)
CREATE INDEX projects_user_recent_idx ON public.projects(user_id, last_opened_at DESC NULLS LAST);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view only their own projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Projects table created successfully';
  RAISE NOTICE '   - Table: public.projects';
  RAISE NOTICE '   - RLS: Enabled (users can only access own projects)';
  RAISE NOTICE '   - Indexes: user_id, created_at, composite';
  RAISE NOTICE '   - Triggers: updated_at auto-update';
END $$;
