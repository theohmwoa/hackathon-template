-- =====================================================
-- Supabase Auth Schema Setup
-- =====================================================
-- This file sets up the auth schema and grants proper permissions
-- GoTrue (Supabase Auth) will create its own tables automatically
--
-- Order: Runs after 00-supabase-users.sh
-- =====================================================

-- Create auth schema owned by supabase_auth_admin
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;

-- Grant full privileges to supabase_auth_admin (for safety)
GRANT ALL PRIVILEGES ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin;

-- Set default privileges for future objects in auth schema
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON ROUTINES TO supabase_auth_admin;

-- Grant supabase_admin access to auth schema (for migrations and admin tasks)
GRANT USAGE ON SCHEMA auth TO supabase_admin;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_admin;

-- Note: auth.uid() and auth.role() functions will be created by GoTrue
-- We skip creating them here to avoid ownership conflicts with GoTrue migrations
-- RLS examples will only work after GoTrue has run its first migration

-- Note: GoTrue will automatically create these tables when it starts:
-- - auth.users (user accounts)
-- - auth.identities (OAuth identities)
-- - auth.sessions (user sessions)
-- - auth.refresh_tokens (JWT refresh tokens)
-- - auth.audit_log_entries (auth event logs)
-- - auth.schema_migrations (GoTrue version tracking)

-- Log success
DO $$
BEGIN
  RAISE NOTICE '✅ Auth schema created successfully';
  RAISE NOTICE '   - Schema: auth (owned by supabase_auth_admin)';
  RAISE NOTICE '   - Permissions granted to supabase_admin';
  RAISE NOTICE '   - GoTrue will create auth tables and functions on first run';
END $$;
