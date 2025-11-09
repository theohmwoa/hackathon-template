# VPS-First Full-Stack Template

A production-ready full-stack application template designed for rapid deployment to VPS environments. Built with NestJS (backend), Angular 17+ (frontend), and Supabase (database/auth).

## Features

- **Backend**: NestJS with TypeScript, OpenAPI/Swagger documentation
- **Frontend**: Angular 17+ with standalone components, type-safe API integration
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: JWT-based auth with Supabase
- **API Gateway**: Kong for routing and CORS
- **Docker**: Complete docker-compose setup for all services
- **Type Safety**: End-to-end TypeScript with OpenAPI-generated types
- **VPS-Ready**: Optimized for deployment to any VPS (DigitalOcean, Linode, etc.)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
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

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Check service health**:
   ```bash
   ./scripts/check-errors.sh
   ```

5. **Access the application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3333
   - API Docs: http://localhost:3333/api
   - Supabase Studio: http://localhost:54323

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

## Development Workflow

### 1. Generate Database Schema

Add SQL files to `database/init/` with sequential numbering:

```sql
-- database/init/02-posts.sql
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

| Script | Description |
|--------|-------------|
| `setup.sh` | Initial setup - generates secrets, creates .env files |
| `generate-secrets.sh` | Generate secure random secrets |
| `first-run.sh` | First deployment - starts all services, runs health checks |
| `check-errors.sh` | Check all services for errors |
| `deploy-vps.sh` | Automated VPS deployment |
| `monitor.sh` | Monitor service logs in real-time |
| `generate-all.sh` | Generate OpenAPI spec and frontend types |

## Tech Stack

- **Backend Framework**: NestJS 10+
- **Frontend Framework**: Angular 17+
- **Database**: PostgreSQL 15+ (via Supabase)
- **Authentication**: Supabase Auth (GoTrue)
- **API Gateway**: Kong
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Containerization**: Docker & Docker Compose
- **Type Generation**: openapi-typescript

## License

MIT
