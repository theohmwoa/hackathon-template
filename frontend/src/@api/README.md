# Generated API Types

This folder contains TypeScript interfaces generated from the backend OpenAPI specification.

## How it works

1. Backend generates OpenAPI spec: `npm run generate:openapi` (in backend folder)
2. Frontend generates TypeScript types: `npm run generate:api` (in frontend folder)
3. Generated files will appear here and can be imported in your Angular components/services

## Usage Example

```typescript
import { User, CreateUserDto } from '@api/types';

// Use the types in your service
@Injectable()
export class UserService {
  createUser(user: CreateUserDto): Observable<User> {
    // Implementation
  }
}
```

## Note

Do not manually edit files in this folder as they will be overwritten during the next generation.
