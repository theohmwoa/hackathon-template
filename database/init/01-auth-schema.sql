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

-- =====================================================
-- Create auth.users table
-- =====================================================
-- This must exist before GoTrue migrations run, as they expect to find this table
-- The schema matches GoTrue's expected structure to prevent migration conflicts
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id UUID,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aud VARCHAR(255),
  role VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  confirmation_token VARCHAR(255),
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_token VARCHAR(255),
  recovery_sent_at TIMESTAMP WITH TIME ZONE,
  email_change_token_new VARCHAR(255),
  email_change VARCHAR(255),
  email_change_sent_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone VARCHAR(15) DEFAULT NULL UNIQUE,
  phone_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone_change VARCHAR(15) DEFAULT '',
  phone_change_token VARCHAR(255) DEFAULT '',
  phone_change_sent_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current VARCHAR(255) DEFAULT '',
  email_change_confirm_status SMALLINT DEFAULT 0,
  banned_until TIMESTAMP WITH TIME ZONE,
  reauthentication_token VARCHAR(255) DEFAULT '',
  reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
  is_sso_user BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for auth.users
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS users_is_anonymous_idx ON auth.users ((raw_app_meta_data->>'is_anonymous'));

-- Set ownership to supabase_auth_admin so GoTrue can manage it
ALTER TABLE auth.users OWNER TO supabase_auth_admin;

-- =====================================================
-- Create auth helper functions
-- =====================================================
-- These functions are essential for RLS policies and must exist before
-- any policies that reference them are created

-- auth.uid() - Returns the user ID from the JWT token
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;

-- auth.role() - Returns the role from the JWT token
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
  )::text
$$;

-- Set ownership of functions to supabase_auth_admin
ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;
ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

-- Grant execute permissions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;

-- =====================================================
-- Note: GoTrue will create additional tables on first run:
-- =====================================================
-- - auth.identities (OAuth identities)
-- - auth.sessions (user sessions)
-- - auth.refresh_tokens (JWT refresh tokens)
-- - auth.audit_log_entries (auth event logs)
-- - auth.schema_migrations (GoTrue version tracking)
-- =====================================================

-- Log success
DO $$
BEGIN
  RAISE NOTICE '✅ Auth schema created successfully';
  RAISE NOTICE '   - Schema: auth (owned by supabase_auth_admin)';
  RAISE NOTICE '   - Table: auth.users (complete schema)';
  RAISE NOTICE '   - Functions: auth.uid(), auth.role()';
  RAISE NOTICE '   - Permissions granted to supabase_admin';
  RAISE NOTICE '   - Ready for GoTrue migrations and RLS policies';
END $$;
