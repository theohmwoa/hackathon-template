#!/bin/bash
# =====================================================
# Supabase Database Users and Roles Setup
# =====================================================
# This script creates all necessary database users and roles
# for Supabase services to function properly
#
# Order matters: This runs FIRST (00-prefix)
# =====================================================

set -e

# Use POSTGRES_PASSWORD from environment for all users
# In production, you can set separate passwords via environment variables
SUPABASE_PASSWORD="${SUPABASE_PASSWORD:-$POSTGRES_PASSWORD}"

echo "Creating Supabase roles and users..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Create roles for Row Level Security (RLS)
  -- These roles are used by Supabase for authentication
  CREATE ROLE anon NOLOGIN NOINHERIT;
  CREATE ROLE authenticated NOLOGIN NOINHERIT;
  CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;

  -- Create admin user for Supabase services
  -- Used by realtime service and general admin operations
  CREATE USER supabase_admin WITH
    PASSWORD '$SUPABASE_PASSWORD'
    CREATEROLE
    CREATEDB
    REPLICATION
    BYPASSRLS;

  -- Create auth admin user
  -- Used by GoTrue (Supabase Auth) service
  CREATE USER supabase_auth_admin WITH
    PASSWORD '$SUPABASE_PASSWORD'
    CREATEDB
    CREATEROLE;

  -- Create authenticator user
  -- This is the user that PostgREST uses to connect
  -- It switches roles based on JWT tokens (anon, authenticated, service_role)
  CREATE USER authenticator WITH
    PASSWORD '$SUPABASE_PASSWORD'
    NOINHERIT;

  -- Create storage admin user (for future Supabase Storage integration)
  CREATE USER supabase_storage_admin WITH
    PASSWORD '$SUPABASE_PASSWORD';

  -- Grant necessary privileges to supabase_admin
  GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_admin;
  GRANT ALL PRIVILEGES ON SCHEMA public TO supabase_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_admin;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_admin;
  GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_admin;

  -- Grant auth admin permissions on public schema (for migrations)
  GRANT ALL PRIVILEGES ON SCHEMA public TO supabase_auth_admin;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

  -- Grant roles to authenticator so it can switch between them
  -- This is crucial for RLS to work properly
  GRANT anon TO authenticator;
  GRANT authenticated TO authenticator;
  GRANT service_role TO authenticator;

  -- Grant public schema access to all roles
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

  -- Set default privileges for future tables
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

  -- Set search_path for supabase_auth_admin to find auth schema tables
  ALTER USER supabase_auth_admin SET search_path TO auth, public;
EOSQL

echo "✅ Supabase users and roles created successfully"
echo "   - Roles: anon, authenticated, service_role"
echo "   - Users: supabase_admin, supabase_auth_admin, authenticator, supabase_storage_admin"
