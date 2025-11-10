# VPS-First Full-Stack Template

A production-ready full-stack application template designed for rapid deployment to VPS environments. Built with NestJS (backend), Angular 17+ (frontend), and Supabase (database/auth).

## Features

- **Backend**: NestJS with TypeScript, OpenAPI/Swagger documentation (runs natively with PM2)
- **Frontend**: Angular 17+ with standalone components, type-safe API integration (runs natively with PM2)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS) (runs in Docker)
- **Authentication**: JWT-based auth with Supabase (runs in Docker)
- **API Gateway**: Kong for routing and CORS (runs in Docker)
- **Process Manager**: PM2 for backend/frontend with live reload and watch mode
- **Type Safety**: End-to-end TypeScript with OpenAPI-generated types
- **VPS-Ready**: Optimized for deployment to any VPS (DigitalOcean, Linode, etc.)
- **Hot Reload**: Instant feedback during development - see changes as you code!

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PM2 (will be installed automatically)
- A VPS with at least 2GB RAM (for deployment)

### Local Development

1. **Clone this repository**:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Run the setup script**:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
   This will:
   - Generate secure secrets
   - Create .env files
   - Install dependencies
   - Set up the database

3. **Start the development environment**:

   **Option 1 - Quick start (recommended)**:
   ```bash
   ./start.sh
   ```
   This will:
   - Start Supabase services in Docker
   - Start backend and frontend with PM2
   - Enable live reload and watch mode

   **Option 2 - Manual start**:
   ```bash
   npm install              # Install PM2
   npm run dev              # Start everything
   ```

4. **Monitor your applications**:
   ```bash
   pm2 logs                 # View all logs
   pm2 logs backend         # View backend logs only
   pm2 logs frontend        # View frontend logs only
   pm2 monit                # Interactive monitoring
   pm2 status               # Check process status
   ```

5. **Stop the development environment**:
   ```bash
   ./stop.sh                # Stop everything
   # OR
   npm run stop             # Stop PM2 processes only
   npm run docker:down      # Stop Docker services
   ```

6. **Access the application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3333
   - API Docs: http://localhost:3333/api
   - Supabase Studio: http://localhost:3000
   - Supabase API: http://localhost:8000

### Why This Architecture?

**Native Backend & Frontend**:
- Instant hot reload - see changes immediately as you code
- Better performance during development
- Easier debugging with direct access to processes
- Perfect for AI-assisted development (like with Claude Code)

**Dockerized Supabase**:
- Isolated database and auth services
- Easy to reset and manage
- Production-like environment
- No conflicts with host machine

## Project Structure

```
.
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module (example)
│   │   ├── supabase/       # Supabase client integration
│   │   └── generate-openapi.ts  # OpenAPI spec generator
│   └── package.json
│
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Core services (API, Auth, Supabase)
│   │   │   └── features/  # Feature modules
│   │   └── @api/          # Generated API types (from OpenAPI)
│   ├── scripts/
│   │   └── generate-api-types.js  # Type generation script
│   └── package.json
│
├── database/
│   └── init/              # Database initialization scripts
│       ├── 01-init.sql    # Extensions and functions
│       └── 01-auth-schema.sql  # Auth tables
│
├── scripts/               # Utility scripts
│   ├── setup.sh          # Initial setup
│   ├── first-run.sh      # First deployment
│   ├── check-errors.sh   # Health checks
│   ├── deploy-vps.sh     # VPS deployment
│   └── generate-secrets.sh  # Secret generation
│
└── docker-compose.yml    # All services configuration
```

## Database and Auth Setup

### Supabase Authentication

The template includes a pre-configured Supabase auth setup that:

1. **Creates the complete `auth.users` table** with all columns required by GoTrue (Supabase Auth)
2. **Provides auth helper functions** (`auth.uid()`, `auth.role()`) for RLS policies
3. **Sets proper ownership** to `supabase_auth_admin` for GoTrue migrations
4. **Configures JWT secrets** that match the Supabase demo keys

### Important Notes

#### UUID Generation

Always use `gen_random_uuid()` instead of `uuid_generate_v4()`:

```sql
-- ✅ Correct - built-in PostgreSQL function
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- ❌ Wrong - requires uuid-ossp extension
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

The `gen_random_uuid()` function is built into PostgreSQL 13+ and doesn't require any extensions.

#### JWT Secret Configuration

The template uses Supabase demo keys for development. **IMPORTANT:**

- The `JWT_SECRET` in `.env` **must match** the secret used to sign `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY`
- Demo secret: `super-secret-jwt-token-with-at-least-32-characters-long`
- Demo keys are **PUBLIC** - never use them in production!

For production deployment:
1. Generate a new `JWT_SECRET`: `openssl rand -base64 48 | tr -d "=+/" | cut -c1-64`
2. Generate new Supabase keys using your `JWT_SECRET` at https://supabase.com/docs/guides/auth/jwts
3. Update all three values in `.env`

#### Row Level Security (RLS)

You can safely use `auth.uid()` and `auth.role()` in RLS policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can access all data
CREATE POLICY "Service role has full access" ON public.posts
  FOR ALL USING (auth.role() = 'service_role');
```

These functions are created during database initialization and are available immediately.

## Development Workflow

### 1. Generate Database Schema

Add SQL files to `database/init/` with sequential numbering:

```sql
-- database/init/02-posts.sql
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own posts" ON public.posts
  FOR ALL USING (auth.uid() = user_id);
```

### 2. Generate Backend Module

Create NestJS modules for your entities:

```bash
cd backend
npm run generate:module posts  # or create manually
```

Then implement:
- DTOs with validation (`dto/create-post.dto.ts`, `dto/update-post.dto.ts`)
- Entity class (`entities/post.entity.ts`)
- Service with CRUD operations (`posts.service.ts`)
- Controller with OpenAPI decorators (`posts.controller.ts`)

### 3. Generate OpenAPI Specification

```bash
cd backend
npm run generate:openapi
```

This creates `backend/openapi.json` with your API specification.

### 4. Generate Frontend Types

```bash
cd frontend
npm run generate:api
```

This generates TypeScript types in `frontend/src/@api/types.ts` from the OpenAPI spec.

### 5. Create Frontend Components

Create Angular services and components using the generated types:

```typescript
// Service
import { components } from '@api/types';
type Post = components['schemas']['Post'];

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Post[]> {
    return this.api.get<Post[]>('posts');
  }
}
```

## Deployment

### Deploy to VPS

1. **Copy template to VPS**:
   ```bash
   scp -r . user@your-vps-ip:/opt/app/
   ```

2. **SSH into VPS and run setup**:
   ```bash
   ssh user@your-vps-ip
   cd /opt/app
   ./scripts/setup.sh
   ```

3. **Start services**:
   ```bash
   ./scripts/first-run.sh
   ```

4. **Configure DNS**:
   Point your domain to the VPS IP address.

5. **Monitor logs**:
   ```bash
   ./scripts/monitor.sh
   ```

## API Documentation

Once running, visit http://localhost:3333/api for interactive API documentation (Swagger UI).

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

### Login

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

## Scripts Reference

### Startup Scripts

| Script | Description |
|--------|-------------|
| `./start.sh` | Start Supabase (Docker) + Backend + Frontend (PM2) |
| `./stop.sh` | Stop all services (Docker + PM2) |
| `npm run dev` | Start backend and frontend with PM2 (Supabase must be running) |
| `npm run stop` | Stop PM2 processes |
| `npm run restart` | Restart PM2 processes |
| `npm run logs` | View all PM2 logs |
| `npm run logs:backend` | View backend logs only |
| `npm run logs:frontend` | View frontend logs only |
| `npm run monit` | Interactive PM2 monitoring dashboard |
| `npm run status` | Check PM2 process status |

### Utility Scripts

| Script | Description |
|--------|-------------|
| `setup.sh` | Initial setup - generates secrets, creates .env files |
| `generate-secrets.sh` | Generate secure random secrets |
| `first-run.sh` | First deployment - starts all services, runs health checks |
| `check-errors.sh` | Check all services for errors |
| `deploy-vps.sh` | Automated VPS deployment |
| `monitor.sh` | Monitor service logs in real-time |
| `generate-all.sh` | Generate OpenAPI spec and frontend types |

### PM2 Commands

PM2 is used to manage the backend and frontend processes:

```bash
pm2 status              # Check status of all processes
pm2 logs                # View all logs (live tail)
pm2 logs backend        # View backend logs only
pm2 logs frontend       # View frontend logs only
pm2 monit               # Interactive monitoring dashboard
pm2 restart all         # Restart all processes
pm2 restart backend     # Restart backend only
pm2 restart frontend    # Restart frontend only
pm2 stop all            # Stop all processes
pm2 delete all          # Stop and remove all processes
pm2 flush               # Clear all logs
```

## Tech Stack

- **Backend Framework**: NestJS 10+
- **Frontend Framework**: Angular 17+
- **Process Manager**: PM2 (for backend and frontend)
- **Database**: PostgreSQL 15+ (via Supabase)
- **Authentication**: Supabase Auth (GoTrue)
- **API Gateway**: Kong
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Containerization**: Docker & Docker Compose (for Supabase services only)
- **Type Generation**: openapi-typescript

## License

MIT
