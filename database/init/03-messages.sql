-- =====================================================
-- Chat Messages Table Schema
-- =====================================================
-- Description: Stores chat messages between users and AI assistant in WebFlow Pro
-- Dependencies: auth.users, public.projects
-- RLS: Users can only access messages for their own projects
-- =====================================================

-- Table Definition
CREATE TABLE IF NOT EXISTS public.chat_messages (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Attributes
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  -- Timestamps (required)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.chat_messages IS 'Stores chat messages between users and AI assistant in WebFlow Pro';
COMMENT ON COLUMN public.chat_messages.project_id IS 'Project this message belongs to (cascading delete when project is deleted)';
COMMENT ON COLUMN public.chat_messages.role IS 'Message sender role: either "user" or "assistant"';
COMMENT ON COLUMN public.chat_messages.content IS 'Message content/text';

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index (critical for joins and cascading deletes)
CREATE INDEX chat_messages_project_id_idx ON public.chat_messages(project_id);

-- Sorting/pagination optimization (chronological message order - ascending for reading)
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages(created_at ASC);

-- Composite index for project-specific queries with sorting (most common query pattern)
CREATE INDEX chat_messages_project_created_idx ON public.chat_messages(project_id, created_at ASC);

-- Role-based filtering index (for filtering by user vs assistant messages)
CREATE INDEX chat_messages_role_idx ON public.chat_messages(role);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages for their own projects
-- This policy checks ownership through the projects table
CREATE POLICY "Users can view chat messages for own projects" ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create messages for their own projects
CREATE POLICY "Users can create chat messages for own projects" ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update messages for their own projects
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

-- Users can delete messages for their own projects
CREATE POLICY "Users can delete chat messages for own projects" ON public.chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Success Log
DO $$
BEGIN
  RAISE NOTICE '✅ Chat Messages table created successfully';
  RAISE NOTICE '   - Table: public.chat_messages';
  RAISE NOTICE '   - RLS: Enabled (users can only access messages for own projects)';
  RAISE NOTICE '   - Indexes: project_id, created_at, role, composites';
  RAISE NOTICE '   - Constraints: role CHECK (user or assistant)';
END $$;
