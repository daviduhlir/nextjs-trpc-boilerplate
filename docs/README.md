# Documentation

This directory contains detailed documentation about the application architecture, security, and development guide.

## Files

- **DEVELOPMENT.md** - Step-by-step guides for creating new pages, routes, and secured features (START HERE!)
- **PROMPTING.md** - Guide for prompting AI (Claude Code, etc.) to generate features
- **ARCHITECTURE.md** - Application architecture, layered design, and data flow
- **SECURITY.md** - Authentication, JWT tokens, permission checking, and best practices

## Quick Links

### Getting Started (READ FIRST)
Read [DEVELOPMENT.md](./DEVELOPMENT.md) to learn:
- How to create a new Frontend page
- How to create a new tRPC route
- How to create secured (protected) routes
- Service + DAO pattern implementation
- Writing tests
- Best practices and common patterns

### Using AI to Generate Code
Read [PROMPTING.md](./PROMPTING.md) to learn:
- How to write effective prompts for AI (Claude Code, etc.)
- What to include in prompts (permissions, tests, code style)
- Common mistakes to avoid
- Copy-paste prompt templates for different features
- Post-generation checklist to verify code quality

### For New Developers
Start with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand:
- Layered architecture (Routes → Services → DAOs → Database)
- Service dependency injection
- Permission context flow
- Database configuration

### For Security & Authentication
Read [SECURITY.md](./SECURITY.md) to learn:
- JWT token setup and format
- Creating protected endpoints
- Permission checking in services/DAOs
- Best practices for production
- Permission flow diagrams

## Overview

### Architecture Pattern
```
tRPC Routes
    ↓
Business Logic Services
    ↓
Data Access Objects (DAOs)
    ↓
DatabaseService (Prisma)
    ↓
PostgreSQL
```

### Permission Model
```
protectedProcedure (middleware)
    ↓
Sets async_local_storage context
    ↓
Service/DAO checks permissions
    ↓
PermissionsGuard validates
```

## Key Concepts

### Services
- **DatabaseService** - Manages Prisma client lifecycle
- **DAOs** - Data access layer (e.g., UserDAO)
- **Business Services** - Business logic (e.g., UserService)

### Dependency Injection
All services use `@ServicesContext.inject()` decorator:
```typescript
export class UserDAO extends Service {
  @ServicesContext.inject(DatabaseService)
  protected databaseService!: DatabaseService;
}
```

### Permission Checking
Permissions are checked in service/DAO methods:
```typescript
await PermissionsGuard.checkRequiredPermissions(['user/delete']);
```

## Related Files

- `src/server/init.ts` - Service initialization
- `src/server/auth/procedures.ts` - tRPC procedure definitions
- `src/server/services/` - All service implementations
- `src/server/routers/` - tRPC route handlers
- `prisma/schema.prisma` - Database schema
