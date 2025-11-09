# Template Fixes Applied

This document summarizes the fixes applied to resolve Supabase initialization issues.

## Issues Fixed

### 1. Missing auth.users Table

**Problem**: GoTrue expected `auth.users` to exist before running migrations, but the template didn't create it.

**Fix**: Added complete `auth.users` table creation in `database/init/01-auth-schema.sql` with all 33 columns matching GoTrue's schema:
- All user authentication fields (email, password, tokens)
- Phone authentication fields
- Metadata fields (raw_app_meta_data, raw_user_meta_data)
- SSO and reauthentication fields
- Proper indexes and ownership

**Impact**: GoTrue can now run its migrations without errors.

### 2. Missing auth Helper Functions

**Problem**: RLS policies require `auth.uid()` and `auth.role()` functions, but they weren't available during initialization.

**Fix**: Added both functions in `database/init/01-auth-schema.sql`:
```sql
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID
CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT
```

**Impact**: RLS policies can now safely reference these functions from any init script.

### 3. JWT Secret Mismatch

**Problem**: `scripts/generate-secrets.sh` generated a random `JWT_SECRET`, but used hardcoded Supabase demo keys signed with a different secret (`super-secret-jwt-token-with-at-least-32-characters-long`).

**Fix**: Updated `generate-secrets.sh` to use the demo secret consistently:
```bash
JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
```

Added extensive documentation warning users:
- JWT_SECRET must match the signing secret of Supabase keys
- Demo keys are PUBLIC and should never be used in production
- Instructions for generating production keys

**Impact**: JWT validation now works correctly in development.

### 4. Documentation Improvements

**Updated**:
- `.env.example` - Added warnings about demo keys and JWT secret relationship
- `README.md` - Added "Database and Auth Setup" section with:
  - UUID generation best practices (use `gen_random_uuid()`, not `uuid_generate_v4()`)
  - JWT secret configuration guide
  - RLS policy examples using auth functions
  - Production deployment instructions for JWT keys

## For Database-Agent Developers

### Recommendation: Use gen_random_uuid() by Default

The database-agent should generate SQL using `gen_random_uuid()` instead of `uuid_generate_v4()`:

**Rationale**:
- `gen_random_uuid()` is built into PostgreSQL 13+ (no extension required)
- `uuid_generate_v4()` requires the `uuid-ossp` extension
- Supabase and modern PostgreSQL environments may have restricted extension permissions
- Using built-in functions improves portability and reduces dependencies

**Example**:
```sql
-- ✅ Recommended
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- ❌ Avoid
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

## Files Modified

1. `database/init/01-auth-schema.sql` - Complete auth setup
2. `scripts/generate-secrets.sh` - Fixed JWT secret generation
3. `.env.example` - Added JWT documentation
4. `README.md` - Added database and auth setup guide

## Testing

After these fixes, the template should:
1. ✅ Initialize database without UUID extension errors
2. ✅ Create auth.users table before GoTrue migrations
3. ✅ Provide auth.uid() and auth.role() for RLS policies
4. ✅ Allow GoTrue to run migrations successfully
5. ✅ Validate JWT tokens correctly

## Production Deployment Notes

Before deploying to production:

1. **Generate new JWT secrets**:
   ```bash
   openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
   ```

2. **Generate new Supabase keys** using the new secret at:
   https://supabase.com/docs/guides/auth/jwts

3. **Update .env** with all three values:
   - JWT_SECRET
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY

4. **Never use demo keys in production** - they are publicly known!
