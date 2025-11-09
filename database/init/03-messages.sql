-- =====================================================
-- Messages Table Schema
-- =====================================================
-- Description: Stores chat messages between users and AI assistant
-- Dependencies: auth.users, public.projects
-- RLS: Users can only access messages for their own projects
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.messages (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Attributes
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),

  -- Timestamps (required)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.messages IS 'Stores chat messages between users and AI assistant in the Lovable-style chat application';
COMMENT ON COLUMN public.messages.project_id IS 'Project this message belongs to (cascading delete when project is deleted)';
COMMENT ON COLUMN public.messages.user_id IS 'User who owns this message thread (references Supabase auth.users)';
COMMENT ON COLUMN public.messages.content IS 'Message content/text';
COMMENT ON COLUMN public.messages.role IS 'Message sender role: either "user" or "assistant"';

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key indexes (critical for joins and cascading deletes)
CREATE INDEX messages_project_id_idx ON public.messages(project_id);
CREATE INDEX messages_user_id_idx ON public.messages(user_id);

-- Sorting/pagination optimization (chronological message order)
CREATE INDEX messages_created_at_idx ON public.messages(created_at DESC);

-- Composite index for project-specific queries with sorting (most common query pattern)
CREATE INDEX messages_project_created_idx ON public.messages(project_id, created_at ASC);

-- Composite index for user-specific queries
CREATE INDEX messages_user_created_idx ON public.messages(user_id, created_at DESC);

-- Role-based filtering index (for filtering by user vs assistant messages)
CREATE INDEX messages_role_idx ON public.messages(role);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own projects
-- This policy checks ownership through the projects table
CREATE POLICY "Users can view messages for own projects" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create messages for their own projects
CREATE POLICY "Users can create messages for own projects" ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- Users can update messages for their own projects
CREATE POLICY "Users can update messages for own projects" ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- Users can delete messages for their own projects
CREATE POLICY "Users can delete messages for own projects" ON public.messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp (reuses function from projects table)
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Messages table created successfully';
  RAISE NOTICE '   - Table: public.messages';
  RAISE NOTICE '   - RLS: Enabled (users can only access messages for own projects)';
  RAISE NOTICE '   - Indexes: project_id, user_id, created_at, role, composites';
  RAISE NOTICE '   - Triggers: updated_at auto-update';
  RAISE NOTICE '   - Constraints: role CHECK (user or assistant)';
END $$;
