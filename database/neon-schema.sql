-- =====================================================
-- Neon Database Schema Setup
-- =====================================================
-- This file contains all schemas adapted for Neon PostgreSQL
-- Run this file with: psql <DATABASE_URL> -f neon-schema.sql
-- =====================================================

-- =====================================================
-- Auth Schema Setup (Simplified for Neon)
-- =====================================================

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table (simplified for non-Supabase use)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB DEFAULT '{}'::jsonb,
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for auth.users
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- =====================================================
-- Auth Helper Functions
-- =====================================================
-- These functions are required for RLS policies

-- auth.uid() - Returns the user ID from custom session context
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_user_id', true), '')::uuid,
    NULL
  )
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO PUBLIC;

-- =====================================================
-- Projects Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT DEFAULT 'react' CHECK (framework IN ('react', 'vue', 'angular')),
  template TEXT DEFAULT 'blank',
  thumbnail_url TEXT,
  is_deployed BOOLEAN DEFAULT false,
  deployment_url TEXT,
  last_opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.projects IS 'Stores user projects for WebFlow Pro, an AI-powered web development platform';
COMMENT ON COLUMN public.projects.user_id IS 'Owner of the project (references auth.users)';

-- Indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_last_opened_idx ON public.projects(last_opened_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS projects_framework_idx ON public.projects(framework);
CREATE INDEX IF NOT EXISTS projects_is_deployed_idx ON public.projects(is_deployed);
CREATE INDEX IF NOT EXISTS projects_user_created_idx ON public.projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS projects_user_recent_idx ON public.projects(user_id, last_opened_at DESC NULLS LAST);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers
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

-- =====================================================
-- Chat Messages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.chat_messages IS 'Stores chat messages between users and AI assistant in WebFlow Pro';

-- Indexes
CREATE INDEX IF NOT EXISTS chat_messages_project_id_idx ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS chat_messages_project_created_idx ON public.chat_messages(project_id, created_at ASC);
CREATE INDEX IF NOT EXISTS chat_messages_role_idx ON public.chat_messages(role);

-- RLS Policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages for own projects" ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat messages for own projects" ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chat messages for own projects" ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chat messages for own projects" ON public.chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- Project Files Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('tsx', 'css', 'html', 'json')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, file_path)
);

-- Comments
COMMENT ON TABLE public.project_files IS 'Stores code files and content for WebFlow Pro projects';

-- Indexes
CREATE INDEX IF NOT EXISTS project_files_project_id_idx ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS project_files_path_idx ON public.project_files(file_path);
CREATE INDEX IF NOT EXISTS project_files_type_idx ON public.project_files(file_type);
CREATE INDEX IF NOT EXISTS project_files_created_at_idx ON public.project_files(created_at DESC);
CREATE INDEX IF NOT EXISTS project_files_project_created_idx ON public.project_files(project_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files for own projects" ON public.project_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files for own projects" ON public.project_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can delete files for own projects" ON public.project_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON public.project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Deployments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed')),
  deployment_url TEXT,
  build_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.deployments IS 'Tracks deployment history and status for WebFlow Pro projects';

-- Indexes
CREATE INDEX IF NOT EXISTS deployments_project_id_idx ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS deployments_status_idx ON public.deployments(status);
CREATE INDEX IF NOT EXISTS deployments_created_at_idx ON public.deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS deployments_project_created_idx ON public.deployments(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS deployments_status_created_idx ON public.deployments(status, created_at DESC);

-- RLS Policies
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deployments for own projects" ON public.deployments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deployments for own projects" ON public.deployments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can delete deployments for own projects" ON public.deployments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Neon Database Schema Applied Successfully';
  RAISE NOTICE '   - Schema: auth (with simplified users table)';
  RAISE NOTICE '   - Tables: projects, chat_messages, project_files, deployments';
  RAISE NOTICE '   - RLS: Enabled on all tables';
  RAISE NOTICE '   - Indexes: All optimizations applied';
  RAISE NOTICE '   - Ready for use with NestJS backend';
END $$;
