-- Supabase PostgreSQL Initialization
-- This file runs after Supabase's own initialization
-- Supabase already creates: roles, extensions, auth schema, etc.

-- Example: Create a sample table (uncomment when you need it)
-- CREATE TABLE IF NOT EXISTS public.sample_table (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Enable Row Level Security
-- ALTER TABLE public.sample_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- CREATE POLICY "Users can view all records" ON public.sample_table
--   FOR SELECT USING (true);

-- Add your custom tables here after Supabase initialization
-- The Database Agent will generate SQL files in this directory
