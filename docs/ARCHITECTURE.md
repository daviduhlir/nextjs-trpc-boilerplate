# Architecture

## Layered Architecture

Aplikace je strukturovaná do jednotlivých vrstev, kde každá vrstva má jasnou odpovědnost:

```
┌─────────────────────────────────────────────┐
│          tRPC Routes (handlers)              │  ← What gets called from frontend
│  (src/server/routers/*.ts)                   │
└────────────┬────────────────────────────────┘
             │ Uses services
             ▼
┌─────────────────────────────────────────────┐
│       Business Logic Services                │  ← Services implement business rules
│  (src/server/services/*.service.ts)          │    - UserService
└────────────┬────────────────────────────────┘
             │ Uses DAOs for data access
             ▼
┌─────────────────────────────────────────────┐
│      Data Access Objects (DAOs)              │  ← Interfaces with database
│  (src/server/services/*.dao.ts)              │
└────────────┬────────────────────────────────┘
             │ Uses DatabaseService
             ▼
┌─────────────────────────────────────────────┐
│       DatabaseService (Prisma)               │  ← Low-level DB operations
│  (src/server/services/database.service.ts)   │
└─────────────────────────────────────────────┘
```

## Services

### DatabaseService
- Manages Prisma client lifecycle
- Handles connection pooling
- Gracefully handles missing DATABASE_URL
- Usage: `ServicesContext.lookup(DatabaseService).getPrisma()`

```typescript
// DatabaseService automatically initializes Prisma
const prisma = ServicesContext.lookup(DatabaseService).getPrisma();
```

### Data Access Objects (DAOs)
- Encapsulates all database queries
- Acts as intermediary between business logic and database
- Never called directly from routes
- Usage: Routes → Services → DAOs → Database

Example: `UserDAO`
```typescript
export class UserDAO extends Service {
  async create(name: string, email: string) { }
  async findById(id: string) { }
  async findAll() { }
  async update(id: string, data: object) { }
  async delete(id: string) { }
}
```

### Business Logic Services
- Contains business rules and validations
- Uses DAOs to access data
- Can check permissions via PermissionsGuard

Example: `UserService`
```typescript
export class UserService extends Service {
  async createUser(name: string, email: string) {
    const userDAO = ServicesContext.lookup(UserDAO);
    // Business logic here
    return userDAO.create(name, email);
  }
}
```

## Dependency Injection

All services are registered in `src/server/init.ts`:

```typescript
// ORDER MATTERS! Database must initialize before DAOs
await ServicesContext.initialize([
  new DatabaseService(),    // 1. Initialize database first
  new UserDAO(),             // 2. Then DAOs (use database)
  new UserService(),         // 3. Then services (use DAOs)
]);
```

Access services via:
```typescript
const userDAO = ServicesContext.lookup(UserDAO);
const userService = ServicesContext.lookup(UserService);
```

## Permission Context

Permissions are automatically available via `async_local_storage`:

**Route Level (Declaration):**
```typescript
protectedProcedure.mutation(async ({ ctx, input }) => {
  // Permission context is now in async_local_storage via middleware
  // No permission checks here - services handle that
  const userDAO = ctx.services.userDAO;
  return userDAO.delete(input.userId);
})
```

**Service/DAO Level (Runtime Checks):**
```typescript
export class UserDAO extends Service {
  async delete(id: string) {
    // PermissionsGuard automatically gets permissions from async_local_storage
    // Throws exception if user lacks 'user/delete' permission
    await PermissionsGuard.checkRequiredPermissions(['user/delete']);

    // Safe to proceed with deletion
    return this.databaseService.getPrisma().user.delete({ where: { id } });
  }
}
```

**Permission Flow:**
1. `protectedProcedure` requires valid JWT token (UNAUTHORIZED if missing)
2. Middleware wraps handler with `runWithPermissions()` → sets async context
3. Service/DAO calls `checkRequiredPermissions(['user/delete'])`
4. PermissionsGuard retrieves from async context automatically
5. Success or FORBIDDEN exception if permission missing

**Key:** No manual permission passing through layers needed!

## Database Configuration

### Environment Variables

Set `DATABASE_URL` in `.env.local`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Schema

Database schema is defined in `prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Commands

```bash
# Generate Prisma client
npm run db:generate

# Create migration in development
npm run db:migrate:dev

# Apply migrations in production
npm run db:migrate:deploy

# Push schema without migrations (development only)
npm run db:push

# Reset database (development only)
npm run db:reset

# Open Prisma Studio GUI
npm run db:studio
```

## Example: Creating a User

Request flows through layers:

```
1. Frontend calls: trpc.secured.createUser.mutate({ name, email })

2. Route handler (protectedProcedure):
   protectedProcedure.mutation(async ({ ctx, input }) => {
     return ctx.services.userDAO.create(input.name, input.email);
   })

3. DAO layer (UserDAO):
   async create(name: string, email: string) {
     await PermissionsGuard.checkRequiredPermissions(['user/create']);
     return this.databaseService.getPrisma().user.create({ data: { name, email } });
   }

4. Database layer (Prisma):
   INSERT INTO "User" (id, email, name, createdAt, updatedAt)
   VALUES (...)
```

Each layer can be tested independently:
- Routes: Test via tRPC
- Services: Test business logic
- DAOs: Test database queries
- Database: Test with Prisma

## Best Practices

1. **Routes never query database directly** - use services
2. **Services use DAOs** - never direct Prisma calls
3. **DAOs handle all database operations** - centralized queries
4. **Permissions checked in middleware** - automatic context
5. **Database operations are async** - use await
6. **Services are singletons** - initialized once, reused
7. **Test each layer independently** - unit testable design
