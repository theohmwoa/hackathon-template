# Backend API Documentation

## Overview

This document describes the backend API generated for WebFlow Pro, an AI-powered web development platform. The backend is built with NestJS and uses Supabase for data persistence and authentication.

## Base URL

**Development**: `http://localhost:3333`

## OpenAPI Specification

**Location**: `backend/openapi.json`

The complete API specification is available in OpenAPI 3.0 format at 31KB. Use this for generating frontend API clients.

## Authentication

The API uses JWT-based authentication via Supabase.

### Protected Endpoints

All endpoints (except health checks) require an `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

To obtain a token:
1. Use Supabase client to sign in: `supabase.auth.signInWithPassword()`
2. Extract the session token: `session.access_token`
3. Include in all authenticated requests

### Public Endpoints

The following endpoints are publicly accessible (no auth required):
- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /auth/login` - Sign in
- `POST /auth/register` - Sign up

## API Modules

### 1. Projects Module

Manages user projects with complete CRUD operations and starter file generation.

**Base path**: `/projects`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects` | Required | Create a new project with auto-generated starter files |
| GET | `/projects` | Required | Get all user projects (sorted by last_opened_at DESC) |
| GET | `/projects/:id` | Required | Get a single project by ID |
| PATCH | `/projects/:id` | Required | Update project metadata |
| DELETE | `/projects/:id` | Required | Delete project and all associated data |
| PATCH | `/projects/:id/open` | Required | Update last_opened_at timestamp |

**Special Features**:
- When creating a project with `template: 'blank'`, automatically generates:
  - `App.tsx` with Hello World React component
  - `index.html` with basic HTML structure
  - `styles.css` with base styles
- Projects are sorted by `last_opened_at DESC` for recency-based UI
- Supports frameworks: `react`, `vue`, `angular`

**Example Request (Create Project)**:
```json
POST /projects
{
  "name": "My Awesome App",
  "description": "A cutting-edge web application",
  "framework": "react",
  "template": "blank"
}
```

**Example Response**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "987fcdeb-51a2-43f1-b456-789012345678",
  "name": "My Awesome App",
  "description": "A cutting-edge web application",
  "framework": "react",
  "template": "blank",
  "thumbnail_url": null,
  "is_deployed": false,
  "deployment_url": null,
  "last_opened_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Files Module

Manages project files with CRUD operations and validation.

**Base paths**: `/projects/:projectId/files`, `/files/:id`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects/:projectId/files` | Required | Create a new file in project |
| GET | `/projects/:projectId/files` | Required | Get all files in project (sorted by created_at ASC) |
| GET | `/files/:id` | Required | Get a single file by ID |
| PATCH | `/files/:id` | Required | Update file content |
| DELETE | `/files/:id` | Required | Delete file |

**Validation**:
- File path must be unique within a project
- File type must be one of: `tsx`, `css`, `html`, `json`
- Returns 400 if file path already exists

**Example Request (Create File)**:
```json
POST /projects/123e4567-e89b-12d3-a456-426614174000/files
{
  "file_path": "src/components/Button.tsx",
  "file_content": "export default function Button() { return <button>Click me</button> }",
  "file_type": "tsx"
}
```

**Example Response**:
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "file_path": "src/components/Button.tsx",
  "file_content": "export default function Button() { return <button>Click me</button> }",
  "file_type": "tsx",
  "created_at": "2024-01-15T10:35:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

### 3. Chat Module

AI-powered chat interface with mock AI responses.

**Base path**: `/projects/:projectId/messages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects/:projectId/messages` | Required | Send message to AI, receive response |
| GET | `/projects/:projectId/messages` | Required | Get chat history (sorted by created_at ASC) |

**AI Response Logic**:
Mock AI generates responses based on message keywords:
- Contains "button" → "I've added a button component to your App.tsx file..."
- Contains "navbar" or "navigation" → "I've created a responsive navigation bar..."
- Contains "deploy" or "deployment" → "To deploy your project, click the Deploy button..."
- Default → "I understand you want to [first 50 chars]. Let me help you build that component."

**Example Request (Send Message)**:
```json
POST /projects/123e4567-e89b-12d3-a456-426614174000/messages
{
  "content": "Can you help me add a button component?"
}
```

**Example Response**:
```json
{
  "userMessage": {
    "id": "msg-user-123",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "user",
    "content": "Can you help me add a button component?",
    "created_at": "2024-01-15T10:40:00Z"
  },
  "assistantMessage": {
    "id": "msg-assistant-456",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "assistant",
    "content": "I've added a button component to your App.tsx file. The button uses our design system with the primary blue color.",
    "created_at": "2024-01-15T10:40:01Z"
  }
}
```

---

### 4. Deployments Module

Mock deployment system with automated status progression.

**Base paths**: `/projects/:projectId/deploy`, `/projects/:projectId/deployments`, `/deployments/:id`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/projects/:projectId/deploy` | Required | Trigger new deployment |
| GET | `/projects/:projectId/deployments` | Required | Get deployment history (sorted by created_at DESC) |
| GET | `/deployments/:id` | Required | Get deployment status |
| GET | `/deployments/:id/logs` | Required | Get build logs |

**Mock Deployment Behavior**:

When POST `/deploy` is called:
1. Creates deployment with `status: 'pending'`
2. Returns immediately with pending status
3. Auto-progresses through states with delays:
   - **pending** (2 seconds)
   - **building** (3 seconds) - Adds build logs
   - **deploying** (2 seconds) - Adds deployment logs
   - **success** (final) - Updates project with deployment URL

**Deployment URL Format**:
```
https://{project-name-slugified}-{random-6-chars}.webflowpro.app
```

Example: `https://my-awesome-app-a3f9k2.webflowpro.app`

**Mock Build Logs**:
```
Installing dependencies...
✓ Dependencies installed (234 packages)

Building project...
✓ TypeScript compilation successful
✓ Assets optimized

Deploying to CDN...
✓ Files uploaded
✓ DNS configured

Deployment successful!
Your site is live at https://[project-name]-[random-id].webflowpro.app
```

**Example Request (Trigger Deployment)**:
```json
POST /projects/123e4567-e89b-12d3-a456-426614174000/deploy
```

**Example Response (Immediate)**:
```json
{
  "id": "deploy-123",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "deployment_url": null,
  "build_log": null,
  "created_at": "2024-01-15T10:45:00Z",
  "updated_at": "2024-01-15T10:45:00Z"
}
```

**Example Response (After 7 seconds, GET /deployments/:id)**:
```json
{
  "id": "deploy-123",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "success",
  "deployment_url": "https://my-awesome-app-a3f9k2.webflowpro.app",
  "build_log": "Installing dependencies...\n✓ Dependencies installed (234 packages)\n\nBuilding project...\n✓ TypeScript compilation successful\n✓ Assets optimized\n\nDeploying to CDN...\n✓ Files uploaded\n✓ DNS configured\n\nDeployment successful!\nYour site is live at https://my-awesome-app-a3f9k2.webflowpro.app",
  "created_at": "2024-01-15T10:45:00Z",
  "updated_at": "2024-01-15T10:45:07Z"
}
```

---

## Error Responses

Standard HTTP error codes:

- **400 Bad Request** - Invalid input data (validation failed)
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Authenticated but not authorized for this resource
- **404 Not Found** - Resource does not exist
- **500 Internal Server Error** - Server-side error

**Example Error Response**:
```json
{
  "statusCode": 404,
  "message": "Project with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

---

## Data Relationships

### Entity Relationship Overview

```
User (auth.users)
    └─→ Projects (1:N)
            ├─→ Files (1:N, cascade delete)
            ├─→ Messages (1:N, cascade delete)
            └─→ Deployments (1:N, cascade delete)
```

- Deleting a project cascades to all files, messages, and deployments
- All tables use Row Level Security (RLS) for user isolation
- All queries automatically filtered by authenticated user ID

---

## Row Level Security (RLS)

All database operations respect RLS policies:

1. **User Isolation**: Users can only access their own projects
2. **Automatic Filtering**: Supabase RLS automatically filters queries by `auth.uid()`
3. **Project-Based Access**: Child resources (files, messages, deployments) verify project ownership
4. **No Cross-Tenant Leakage**: Impossible for users to access other users' data

---

## Next Steps for Frontend Agent

### 1. Generate TypeScript API Client

From the `frontend` directory, run:

```bash
npm run generate:api
```

This will:
- Read `../backend/openapi.json`
- Generate TypeScript types in `frontend/src/@api/types.ts`
- Generate API client functions

### 2. Use Generated Types

Import generated types in your Angular services:

```typescript
import { components } from '@api/types';

type Project = components['schemas']['Project'];
type ProjectFile = components['schemas']['ProjectFile'];
type ChatMessage = components['schemas']['ChatMessage'];
type Deployment = components['schemas']['Deployment'];
```

### 3. Create Angular Services

For each module, create an Angular service that:
- Injects HttpClient
- Uses generated types
- Handles authentication headers via interceptor
- Provides CRUD methods

**Example Service**:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { components } from '@api/types';

type Project = components['schemas']['Project'];

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  createProject(data: any): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, data);
  }

  // ... other methods
}
```

### 4. Authentication Interceptor

Create an HTTP interceptor to attach JWT token:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

---

## Development & Testing

### Starting the Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3333`

### Environment Variables Required

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Testing Endpoints

Use the OpenAPI spec with tools like:
- **Postman**: Import `backend/openapi.json`
- **Swagger UI**: Available at `http://localhost:3333/api` (when main.ts configured)
- **curl**: Example requests in this document

---

## Implementation Notes

### 1. Starter Files Generation

When creating a project with `template: 'blank'`, the backend automatically creates 3 starter files. This happens in `ProjectsService.create()`:

- `App.tsx` - Basic React component
- `index.html` - HTML entry point
- `styles.css` - Base CSS

### 2. Mock AI Responses

The `ChatService` uses keyword matching for mock responses. In production, replace with actual AI integration (OpenAI, Anthropic, etc.).

### 3. Mock Deployments

The `DeploymentsService` uses `setTimeout` to simulate deployment progression. In production, replace with actual CI/CD integration (Vercel, Netlify, etc.).

### 4. File Path Uniqueness

The `project_files` table has a UNIQUE constraint on `(project_id, file_path)`. Creating a file with a duplicate path returns HTTP 400.

### 5. Cascade Deletes

Deleting a project automatically deletes all associated:
- Files
- Chat messages
- Deployment history

This is enforced by Supabase foreign key constraints with `ON DELETE CASCADE`.

---

## API Design Principles

1. **RESTful Conventions**: Standard HTTP methods and status codes
2. **Resource Nesting**: Related resources nested under parent (e.g., `/projects/:id/files`)
3. **Consistent Responses**: All responses follow same structure
4. **Validation**: Input validation with detailed error messages
5. **Authentication**: JWT-based with Supabase integration
6. **Documentation**: Comprehensive OpenAPI 3.0 spec

---

## Summary

The WebFlow Pro backend provides 4 complete modules:

1. **Projects** - Project management with starter files
2. **Files** - Code file management with validation
3. **Chat** - AI assistant with mock responses
4. **Deployments** - Mock deployment with status progression

All modules are:
- Fully documented in OpenAPI spec
- Protected by authentication
- Isolated by user via RLS
- Ready for frontend integration

**OpenAPI Spec**: `backend/openapi.json` (31KB)

**Total Endpoints**: 15+ REST endpoints

---

**End of Backend API Documentation**
