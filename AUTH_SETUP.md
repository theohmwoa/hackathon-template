# 🔐 Authentication Setup Guide

The template now includes **production-ready authentication** for both backend and frontend!

## ✅ What's Included

### Backend (NestJS)
- **JWT Auth Guard** - Automatically protects all endpoints by default
- **@Public() Decorator** - Mark routes as public (bypass auth)
- **@CurrentUser() Decorator** - Get authenticated user in controllers
- **JWT Verification** - Validates Supabase tokens

### Frontend (Angular)
- **SupabaseService** - Complete auth methods (signup, login, logout)
- **Auth Interceptor** - Auto-adds JWT tokens to API requests
- **Auth Guard** - Protects routes from unauthenticated users
- **Login Component** - Pre-built login form
- **Signup Component** - Pre-built signup form

---

## 🚀 Quick Start

### Backend Usage

#### Protected Endpoint (Default)
```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './auth/decorators';
import { User } from '@supabase/supabase-js';

@Controller('posts')
export class PostsController {
  @Get('my-posts')  // Protected by default!
  getMyPosts(@CurrentUser() user: User) {
    return { userId: user.id, email: user.email };
  }
}
```

#### Public Endpoint
```typescript
import { Public } from './auth/decorators';

@Controller()
export class AppController {
  @Public()  // Anyone can access this
  @Get()
  getHealth() {
    return { status: 'healthy' };
  }
}
```

### Frontend Usage

#### Protect a Route
```typescript
// app.routes.ts
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]  // Requires authentication
  }
];
```

#### Use Auth in Component
```typescript
import { SupabaseService } from '@app/core/services/supabase.service';

export class MyComponent {
  constructor(private supabase: SupabaseService) {
    // Listen to auth state changes
    this.supabase.currentUser$.subscribe(user => {
      console.log('Current user:', user);
    });
  }

  async logout() {
    await this.supabase.signOut();
  }
}
```

---

## 🧪 Testing the Auth Flow

### 1. Test Backend Auth

```bash
# Test 1: Access protected endpoint without auth (should fail)
curl http://localhost:3333/profile
# Response: {"message":"No authentication token provided","error":"Unauthorized","statusCode":401}

# Test 2: Sign up a new user
curl -X POST http://localhost:9999/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Response: { "access_token": "eyJhb...", "user": {...} }

# Test 3: Access protected endpoint with token
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3333/profile
# Response: {"id":"...","email":"test@example.com","role":"authenticated"}

# Test 4: Public endpoints still work
curl http://localhost:3333/health
# Response: {"status":"healthy",...}
```

### 2. Test Frontend Auth

1. Open browser to `http://localhost:4200`
2. Navigate to `/login` or `/signup`
3. Create an account or login
4. You'll be redirected to home page
5. Try accessing a protected route (shows login if not authenticated)

---

## 📁 File Structure

```
backend/src/
├── auth/
│   ├── auth.guard.ts              # JWT verification guard
│   ├── auth.module.ts             # Auth module
│   └── decorators/
│       ├── current-user.decorator.ts  # @CurrentUser()
│       ├── public.decorator.ts        # @Public()
│       └── index.ts

frontend/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          # Route protection
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Auto-add JWT tokens
│   └── services/
│       └── supabase.service.ts    # Auth methods
└── features/
    └── auth/
        ├── login/
        │   └── login.component.ts
        └── signup/
            └── signup.component.ts
```

---

## 🔑 How It Works

### Backend Flow
1. **All routes are protected by default** (via `APP_GUARD`)
2. `AuthGuard` extracts JWT from `Authorization: Bearer <token>`
3. Token is verified with Supabase Auth
4. User object is attached to `request.user`
5. Controllers can access user via `@CurrentUser()` decorator

### Frontend Flow
1. User logs in via `SupabaseService.signIn()`
2. JWT token is stored by Supabase client
3. `authInterceptor` auto-adds token to all API requests
4. `authGuard` protects routes, redirects to login if needed
5. `currentUser$` observable tracks auth state

---

## 🛡️ Security Features

✅ **JWT Token Verification** - All tokens verified with Supabase
✅ **HTTP-Only Session Storage** - Supabase handles secure storage
✅ **Auto-Refresh Tokens** - Supabase auto-refreshes expired tokens
✅ **HTTPS Ready** - Works with production SSL
✅ **No Password Storage** - Passwords handled by Supabase Auth

---

## 📝 Example: Creating a Protected Feature

### 1. Backend Controller
```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CurrentUser } from './auth/decorators';
import { User } from '@supabase/supabase-js';

@Controller('todos')
export class TodosController {
  @Get()  // Protected by default
  getMyTodos(@CurrentUser() user: User) {
    return this.todosService.findByUserId(user.id);
  }

  @Post()
  createTodo(@CurrentUser() user: User, @Body() dto: CreateTodoDto) {
    return this.todosService.create(user.id, dto);
  }
}
```

### 2. Frontend Component
```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todos',
  template: `
    <h1>My Todos</h1>
    <ul>
      <li *ngFor="let todo of todos">{{ todo.title }}</li>
    </ul>
  `
})
export class TodosComponent {
  todos: any[] = [];

  constructor(private http: HttpClient) {
    // Auth token is automatically added by authInterceptor!
    this.http.get('/api/todos').subscribe(data => {
      this.todos = data as any[];
    });
  }
}
```

### 3. Protected Route
```typescript
// app.routes.ts
{
  path: 'todos',
  loadComponent: () => import('./features/todos/todos.component')
    .then(m => m.TodosComponent),
  canActivate: [authGuard]  // Only authenticated users
}
```

---

## 🎯 Next Steps

1. **Customize Login/Signup UI** - Edit components in `frontend/src/app/features/auth/`
2. **Add OAuth Providers** - Configure Google/GitHub in Supabase settings
3. **Implement Password Reset** - Use `supabase.auth.resetPasswordForEmail()`
4. **Add Email Verification** - Configure SMTP in `.env`
5. **Create User Profiles** - Use RLS policies with `auth.uid()`

---

## 🚨 Important Notes

- **All endpoints are protected by default** - Use `@Public()` for public routes
- **Frontend routes are public by default** - Add `canActivate: [authGuard]` to protect
- **Tokens expire after 1 hour** - Auto-refreshed by Supabase
- **Service role key** should ONLY be used in backend (has full DB access)

**Your authentication system is production-ready!** 🎉
