# Security & Authentication Guide

## Overview

This boilerplate uses:
- **JWT tokens** for authentication (via Authorization header)
- **@david.uhlir/permissions-guard** for fine-grained permission checking
- **tRPC procedures** as protected routes

## JWT Token Setup

### 1. Environment Variables

Add to `.env.local`:
```env
JWT_SECRET=your-super-secret-key
```

### 2. Token Format

Your JWT token payload should include:
```typescript
{
  userId: "user123",
  email: "user@example.com",
  permissions: ["user/read", "user/write", "admin"]
}
```

### 3. Usage in Client

Send token in Authorization header:
```typescript
// In your client (e.g., fetch or axios interceptor)
const response = await fetch('/api/trpc/secured.getProfile', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Creating Secured Routes

### Public Endpoint (No Auth Required)
```typescript
import { publicProcedure, router } from '../trpc';

export const myRouter = router({
  publicAction: publicProcedure.query(() => {
    return { message: 'Public data' };
  }),
});
```

### Protected Endpoint (Auth Required)
```typescript
import { protectedProcedure, router } from '../auth/procedures';

export const myRouter = router({
  getProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.userId is guaranteed to exist
    return { userId: ctx.userId };
  }),
});
```

### Permission-Based Endpoint (Specific Permissions)
```typescript
import { permissionProcedure, router } from '../auth/procedures';
import { z } from 'zod';

export const myRouter = router({
  deleteUser: permissionProcedure(['user/delete', 'admin'])
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Permission context is automatically available via PermissionsGuard
      // No need to manually wrap with withPermissions - permissionProcedure does it automatically
      const userService = ctx.services.user;
      userService.deleteUser(input.userId);

      return { success: true };
    }),
});
```

## Using PermissionsGuard in Services

Services can check permissions when they extend `Service`:

```typescript
import { Service, PermissionsGuard } from '@david.uhlir/services';

export class UserService extends Service {
  async deleteUser(userId: string) {
    // Check if current context has permission
    const hasPermission = PermissionsGuard.checkPermission('user/delete');

    if (!hasPermission) {
      throw new Error('No permission to delete user');
    }

    // Delete logic...
  }
}
```

## Permission Checking

### Two Approaches

**1. In Router (Declarative)**
```typescript
permissionProcedure(['user/write', 'admin']).mutation(...)
// Permission is checked before handler runs
```

**2. In Service (Imperative)**
```typescript
const hasPermission = PermissionsGuard.checkPermission('user/write');
if (!hasPermission) throw new Error('No permission');
```

## Complete Example: User Management

See `src/server/routers/secured-example.ts` for full examples:

```typescript
// Public: Check if API is up
secured.status.query()

// Protected: Get current user profile
secured.getProfile.query()

// Permission-based: Create user
secured.createUser.mutate({ name, email })

// Permission-based: Delete user
secured.deleteUser.mutate({ userId })

// Permission-based: List all users
secured.listUsers.query()
```

## Testing

### With Token
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:3000/api/trpc/secured.getProfile
```

### Without Token (Should Fail)
```bash
curl http://localhost:3000/api/trpc/secured.getProfile
# Returns: 401 UNAUTHORIZED
```

## Error Handling

Permission errors return standard tRPC error codes:

- `UNAUTHORIZED` - No token or invalid token
- `FORBIDDEN` - Token valid but missing required permissions
- `BAD_REQUEST` - Invalid request
- `NOT_FOUND` - Resource not found

```typescript
try {
  await trpc.secured.deleteUser.mutate({ userId });
} catch (error) {
  if (error.code === 'FORBIDDEN') {
    // Show permission denied message
  }
}
```

## Flow Diagram

```
Client Request
    ↓
Authorization Header → JWT Token Extraction
    ↓
Extract User ID + Permissions
    ↓
tRPC Middleware Check
    ├─ publicProcedure → ✓ Allow
    ├─ protectedProcedure → User ID exists? → ✓/✗
    └─ permissionProcedure(['x', 'y']) → Has ALL permissions? → ✓/✗
    ↓
Run Handler with Permission Context
    ↓
Service can check PermissionsGuard.checkPermission()
    ↓
Return Response
```

## Best Practices

1. **Always use protectedProcedure or permissionProcedure** for sensitive operations
2. **Declare permissions at router level** (middleware) for clarity
3. **Check permissions in services** for business logic validation using `PermissionsGuard.checkPermission()`
4. **Don't manually wrap with withPermissions()** - `permissionProcedure` does it automatically
5. **Keep permissions granular** (e.g., `user/read`, `user/write`, not just `admin`)
6. **Validate JWT_SECRET** is set in production
7. **Rotate secrets** regularly in production

## How Permission Context Flows

```
Client Request with Authorization Header
    ↓
permissionProcedure middleware extracts permissions
    ↓
PermissionsGuard.runWithPermissions() wraps handler (automatic)
    ↓
Handler executes with async_local_storage context set
    ↓
Services call PermissionsGuard.checkPermission() - gets from context automatically
    ↓
No explicit permission passing needed through async call chain
```
