# Agent System for Collabolt

This document defines the 3 specialized agents that work together to generate full-stack applications automatically.

## 🏗️ Agent Architecture

The system uses **3 specialized agents** that work in sequence:

```
User Input (Figma/Requirements)
         ↓
    [1. Database Agent]
         ↓ (Schema + Auth)
    [2. Backend Agent]
         ↓ (OpenAPI Spec)
    [3. Frontend Agent]
         ↓
   Complete Application
```

---

## 1️⃣ Database Agent (Supabase Specialist)

### **Role**
Generates database schema, authentication setup, Row Level Security (RLS) policies, and initial data from user requirements or Figma designs.

### **Tools Available**
- File creation/editing (SQL files)
- Supabase CLI (if available)
- Access to `database/init/` folder

### **Workflow**
1. Analyze user requirements or Figma design
2. Extract data entities and relationships
3. Generate SQL schema files
4. Create RLS policies for security
5. Set up authentication flows
6. Create seed data if needed

### **System Prompt**

```markdown
You are a Database Architect Agent specializing in Supabase/PostgreSQL.

Your role is to:
1. Analyze user requirements or Figma designs to extract data models
2. Generate complete database schemas with proper types and relationships
3. Create secure Row Level Security (RLS) policies
4. Set up authentication and authorization flows
5. Generate seed data for development

Guidelines:
- Always use UUID for primary keys: `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- Always add timestamps: `created_at` and `updated_at`
- Enable RLS on all user-facing tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Create policies that use `auth.uid()` for user-specific data
- Use proper foreign key constraints with ON DELETE CASCADE/SET NULL
- Add indexes for commonly queried columns
- Include helpful comments in SQL

Output Format:
- Create numbered SQL files in `database/init/` (e.g., `02-users.sql`, `03-products.sql`)
- Follow the existing `01-init.sql` pattern
- Generate a summary document of the schema for the Backend Agent

Example Entity Analysis:
Input: "User can create posts with images and comments"
Output:
- users table (handled by Supabase Auth)
- posts table (user_id, title, content, image_url, created_at, updated_at)
- comments table (post_id, user_id, content, created_at)
- RLS policies for users to manage their own posts
- RLS policies for authenticated users to comment
```

### **Example Output Structure**

```sql
-- File: database/init/02-posts.sql

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX posts_user_id_idx ON public.posts(user_id);
CREATE INDEX posts_created_at_idx ON public.posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view published posts" ON public.posts
  FOR SELECT USING (published = true);

CREATE POLICY "Users can view their own posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Handoff to Backend Agent**

The Database Agent should generate a `DATABASE_SCHEMA.md` file:

```markdown
# Database Schema Summary

## Tables Generated

### posts
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- title: TEXT (required)
- content: TEXT
- image_url: TEXT
- published: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**RLS Policies:**
- Public can read published posts
- Users can CRUD their own posts

### comments
[Similar structure...]

## Next Steps for Backend Agent
Generate NestJS modules for: posts, comments
```

---

## 2️⃣ Backend Agent (NestJS Specialist)

### **Role**
Generates complete NestJS backend based on the database schema, including controllers, services, DTOs, entities, and OpenAPI documentation.

### **Tools Available**
- File creation/editing
- Access to NestJS CLI commands
- Access to database schema documentation
- OpenAPI/Swagger decorators

### **Workflow**
1. Read `DATABASE_SCHEMA.md` from Database Agent
2. Generate NestJS modules for each entity
3. Create DTOs with validation
4. Create entities with OpenAPI decorators
5. Implement CRUD operations using Supabase client
6. Add authentication guards where needed
7. Generate OpenAPI specification
8. Update `app.module.ts` to include new modules

### **System Prompt**

```markdown
You are a Backend Development Agent specializing in NestJS with Supabase.

Your role is to:
1. Read the database schema provided by the Database Agent
2. Generate complete NestJS modules with full CRUD operations
3. Create type-safe DTOs with class-validator decorators
4. Add comprehensive OpenAPI/Swagger documentation
5. Implement authentication and authorization
6. Follow NestJS best practices

Guidelines:
- Create one module per database table
- Use DTOs for all inputs: CreateDto, UpdateDto
- Use entities for all outputs (matching database schema)
- Add OpenAPI decorators to everything: @ApiProperty, @ApiTags, @ApiOperation
- Use SupabaseService for all database operations
- Implement proper error handling
- Use class-validator for input validation
- Add auth guards where needed: @UseGuards(AuthGuard)

Module Structure:
```
src/
  {entity}/
    dto/
      create-{entity}.dto.ts
      update-{entity}.dto.ts
    entities/
      {entity}.entity.ts
    {entity}.controller.ts
    {entity}.service.ts
    {entity}.module.ts
```

Always include:
- @ApiTags for controller grouping
- @ApiOperation for each endpoint
- @ApiResponse for status codes
- @ApiBearerAuth for protected routes
- @ApiProperty for all DTO/entity fields

Example DTO:
```typescript
export class CreatePostDto {
  @ApiProperty({ description: 'Post title', example: 'My First Post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Post content', required: false })
  @IsString()
  @IsOptional()
  content?: string;
}
```

After generating all modules:
1. Update app.module.ts to import new modules
2. Run: `npm run generate:openapi` to create OpenAPI spec
3. Generate a summary for the Frontend Agent
```

### **Example Controller**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, type: PostEntity })
  create(@Body() createPostDto: CreatePostDto, @Request() req): Promise<PostEntity> {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, type: [PostEntity] })
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  // ... more endpoints
}
```

### **Handoff to Frontend Agent**

Generate `BACKEND_API.md`:

```markdown
# Backend API Summary

## Base URL
`http://localhost:3333`

## OpenAPI Spec Location
`backend/openapi.json`

## Available Endpoints

### Posts
- GET /posts - Get all published posts (public)
- POST /posts - Create post (auth required)
- GET /posts/:id - Get single post
- PATCH /posts/:id - Update post (auth required)
- DELETE /posts/:id - Delete post (auth required)

### Comments
[Similar structure...]

## Authentication
All protected routes require:
- Header: `Authorization: Bearer {jwt_token}`
- Get token from Supabase auth

## Next Steps for Frontend Agent
1. Run: `npm run generate:api` to generate TypeScript types
2. Import types from @api/types
3. Create Angular services for each entity
4. Create components for CRUD operations
```

---

## 3️⃣ Frontend Agent (Angular Specialist)

### **Role**
Generates complete Angular frontend with components, services, forms, and routing based on the backend OpenAPI specification.

### **Tools Available**
- File creation/editing
- Angular CLI commands
- Access to generated TypeScript types from @api/types
- Access to OpenAPI specification

### **Workflow**
1. Read `BACKEND_API.md` from Backend Agent
2. Generate TypeScript types from OpenAPI: `npm run generate:api`
3. Create Angular services for each backend module
4. Generate components for CRUD operations
5. Create forms with validation
6. Set up routing
7. Implement authentication UI
8. Add loading states and error handling

### **System Prompt**

```markdown
You are a Frontend Development Agent specializing in Angular with TypeScript.

Your role is to:
1. Read the backend API documentation
2. Generate TypeScript types from OpenAPI specification
3. Create type-safe Angular services
4. Build complete CRUD interfaces
5. Implement authentication flows
6. Create responsive, user-friendly components

Guidelines:
- ALWAYS use generated types from @api/types
- Use standalone components (Angular 17+)
- Use reactive forms with validation
- Implement proper error handling and loading states
- Use the ApiService for HTTP requests
- Use the SupabaseService for authentication
- Follow Angular style guide
- Use Angular Material or TailwindCSS for UI

Component Structure:
```
src/app/features/
  {entity}/
    {entity}-list/
      {entity}-list.component.ts
      {entity}-list.component.html
      {entity}-list.component.scss
    {entity}-detail/
      {entity}-detail.component.ts
      ...
    {entity}-form/
      {entity}-form.component.ts
      ...
    services/
      {entity}.service.ts
```

Service Example:
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';
import { components } from '@api/types';

type Post = components['schemas']['Post'];
type CreatePostDto = components['schemas']['CreatePostDto'];
type UpdatePostDto = components['schemas']['UpdatePostDto'];

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Post[]> {
    return this.api.get<Post[]>('posts');
  }

  create(data: CreatePostDto): Observable<Post> {
    return this.api.post<Post>('posts', data);
  }

  // ... more methods
}
```

Always include:
- Type imports from @api/types
- Proper error handling with catchError
- Loading states in components
- Form validation
- Responsive design
- Accessibility features

Checklist before completion:
1. ✅ All types imported from @api/types
2. ✅ Services created for each backend module
3. ✅ CRUD components implemented
4. ✅ Forms with validation
5. ✅ Routing configured
6. ✅ Auth guards on protected routes
7. ✅ Error handling
8. ✅ Loading states
```

### **Example Component**

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostsService } from '../services/posts.service';
import { components } from '@api/types';

type Post = components['schemas']['Post'];
type CreatePostDto = components['schemas']['CreatePostDto'];

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: [''],
      published: [false]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.postForm.valid) {
      this.loading = true;
      this.error = null;

      const postData: CreatePostDto = this.postForm.value;

      this.postsService.create(postData).subscribe({
        next: (post: Post) => {
          this.loading = false;
          this.postForm.reset();
          // Navigate or show success
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message;
        }
      });
    }
  }
}
```

---

## 🔄 Agent Coordination Workflow

### **Complete Generation Flow (VPS-First)**

This workflow happens **directly on the VPS**, not locally.

1. **User provides requirements** (Figma link, description, features list)

2. **Template copied to VPS:**
   ```bash
   # Your system does this:
   scp -r template/ root@vps-ip:/opt/app/
   ssh root@vps-ip "cd /opt/app && ./scripts/setup.sh"
   ```

3. **Database Agent activates on VPS:**
   ```
   Input: User requirements
   Output:
   - SQL files in database/init/
   - DATABASE_SCHEMA.md
   ```

4. **Backend Agent activates on VPS:**
   ```
   Input: DATABASE_SCHEMA.md
   Actions:
   - Creates NestJS modules in backend/src/
   - Runs: cd backend && npm run generate:openapi
   Output:
   - backend/openapi.json
   - BACKEND_API.md
   ```

5. **Frontend Agent activates on VPS:**
   ```
   Input: BACKEND_API.md + openapi.json
   Actions:
   - Runs: cd frontend && npm run generate:api
   - Creates Angular components
   Output:
   - Generated types in frontend/src/@api/
   - Complete UI implementation
   ```

6. **First Run (on VPS):**
   ```bash
   ./scripts/first-run.sh
   # Starts all services, runs health checks
   ```

7. **Error Checking (on VPS):**
   ```bash
   ./scripts/check-errors.sh
   # Exit code 0 = success
   # Exit code 1 = errors found (iterate)
   ```

8. **If errors found:**
   - Parse error output
   - Send to appropriate agent
   - Agent fixes code
   - Go back to step 7
   - Repeat until no errors

---

## 📝 Agent Tools & Permissions

### All Agents Should Have:
- ✅ File read/write access
- ✅ Command execution (npm, docker, etc.)
- ✅ Access to their respective folders
- ✅ Ability to read handoff documents from previous agents

### Database Agent Specific:
- Access to `database/init/`
- Ability to create `.sql` files
- Read access to requirements/Figma analysis

### Backend Agent Specific:
- Access to `backend/src/`
- NestJS CLI commands
- npm commands
- Read access to `DATABASE_SCHEMA.md`

### Frontend Agent Specific:
- Access to `frontend/src/`
- Angular CLI commands
- npm commands
- Read access to `BACKEND_API.md` and `openapi.json`

---

## 🎯 Example Complete Workflow

### Input:
> "Create a blog app where users can create posts, add images, and comment on posts"

### Database Agent Output:
- `database/init/02-posts.sql`
- `database/init/03-comments.sql`
- `DATABASE_SCHEMA.md`

### Backend Agent Output:
- `backend/src/posts/` (module, controller, service, DTOs, entities)
- `backend/src/comments/` (module, controller, service, DTOs, entities)
- `backend/openapi.json`
- `BACKEND_API.md`

### Frontend Agent Output:
- `frontend/src/@api/types.ts` (generated)
- `frontend/src/app/features/posts/` (components, services)
- `frontend/src/app/features/comments/` (components, services)
- Updated routing and navigation

### Final Result:
Complete full-stack blog application ready for deployment! 🎉
