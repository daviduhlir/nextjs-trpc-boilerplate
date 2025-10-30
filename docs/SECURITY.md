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

### Permission-Protected Endpoint
```typescript
import { protectedProcedure, router } from '../auth/procedures';
import { z } from 'zod';

export const myRouter = router({
  // protectedProcedure requires JWT token and wraps with PermissionsGuard context
  // Actual permission checks happen in service/DAO methods
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Service/DAO will check permissions via PermissionsGuard
      const userDAO = ctx.services.userDAO;
      return userDAO.delete(input.userId);  // DAO calls checkRequiredPermissions()
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

Permission checking happens **only in service/DAO layer**, not in routes.

### Route Level
`protectedProcedure` requires valid JWT token:
- Wraps handler with `runWithPermissions()` to set async context
- Throws `UNAUTHORIZED` if no token
- Does NOT check permissions - that happens in services

### Service/DAO Level (Permission Validation)
```typescript
// In service/DAO method
await PermissionsGuard.checkRequiredPermissions(['user/delete']);
// Gets permissions from async_local_storage (set by protectedProcedure middleware)
// Throws exception if permission missing
```

### How It Works

```typescript
// Route: Requires authentication, permissions checked in service/DAO
deleteUser: protectedProcedure.mutation(async ({ ctx, input }) => {
  return ctx.services.userDAO.delete(input.userId);
})

// Inside DAO/Service: Permissions are checked here
export class UserDAO extends Service {
  async delete(id: string) {
    // PermissionsGuard automatically gets permissions from async_local_storage context
    // Throws exception if user doesn't have 'user/delete' permission
    await PermissionsGuard.checkRequiredPermissions(['user/delete']);

    // Safe to proceed with deletion
    return db.user.delete({ where: { id } });
  }
}
```

**Permission Flow:**
1. `protectedProcedure` requires valid JWT token
2. Middleware wraps handler with `runWithPermissions(permissions, userId, ...)`
3. Permissions stored in `async_local_storage` context
4. Service/DAO calls `checkRequiredPermissions(['user/delete'])`
5. PermissionsGuard retrieves from async context automatically
6. Returns success or throws exception if permission missing

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

1. **Use protectedProcedure or permissionProcedure** - declares which permissions route needs
2. **Check permissions in services/DAOs** - use `await PermissionsGuard.checkRequiredPermissions(['permission'])`
3. **Don't check permissions in routes** - middleware handles it automatically via async context
4. **Never manually call runWithPermissions()** - `permissionProcedure` does it automatically
5. **Keep permissions granular** - e.g., `user/read`, `user/write`, `user/delete`, not just `admin`
6. **Permissions checked at multiple levels** - route level for entry, service level for business logic
7. **Validate JWT_SECRET** is set in production
8. **Rotate secrets** regularly in production

## Permission Context Flow

```
┌─────────────────────────────────────────────────────┐
│ Client Request + Authorization Header               │
│ Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     │
└──────────────────┬──────────────────────────────────┘
                   │
         Extract JWT Token
                   ▼
┌─────────────────────────────────────────────────────┐
│ protectedProcedure middleware                       │
│ - Extract userId and permissions from token         │
│ - Wrap with runWithPermissions() → set async context│
│ - If no token: throw UNAUTHORIZED error             │
└──────────────────┬──────────────────────────────────┘
                   │
         runWithPermissions() sets async context
                   ▼
┌─────────────────────────────────────────────────────┐
│ async_local_storage: {                              │
│   permissions: ['user/delete', 'user/read'],        │
│   userId: 'user123'                                 │
│ }                                                    │
└──────────────────┬──────────────────────────────────┘
                   │
     Handler executes with context available
                   ▼
┌─────────────────────────────────────────────────────┐
│ Service/DAO Layer                                   │
│ async delete(id) {                                  │
│   await PermissionsGuard.checkRequiredPermissions() │
│   // Gets permissions from async_local_storage ↑    │
│   // Throws if missing                              │
│   return db.user.delete(...)                        │
│ }                                                    │
└─────────────────────────────────────────────────────┘
```

**Key Point:** No manual permission passing through layers - `async_local_storage` handles it!
