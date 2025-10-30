# AI Prompting Guide

This guide helps you write effective prompts for AI tools (like Claude Code) to generate new pages, routes, and services for this boilerplate.

## Quick Tips

✅ **DO include:**
- Clear description of the feature
- Which layer you need (Frontend page, tRPC route, Service/DAO)
- Permission requirements
- Data validation (Zod schemas)
- Tests
- Code style requirements (decorators, transient props, etc.)

❌ **DON'T forget:**
- Permissions need `@PermissionsGuard.PermissionRequired()` decorator
- Services use `@ServicesContext.inject()` decorator
- Frontend components use transient props (`$variant`, not `variant`)
- All methods need documentation comments
- Tests should run on built code (`npm test`)
- Backend and frontend must NOT share code (only types)

---

## Example Prompt Template

Copy this template and fill in the blanks for your feature:

```
I need to create a new feature for [FEATURE_NAME].

## Requirements:
- Feature description: [DESCRIBE_WHAT_IT_DOES]
- User roles/permissions: [LIST_PERMISSIONS, e.g., 'posts/create', 'posts/delete']

## Implementation:

### Frontend (Next.js + React):
- Create page at: `src/pages/[PAGE_NAME].tsx`
- Use styled-components with transient props ($variant, $size, etc.)
- Call tRPC routes: `trpc.[ROUTER_NAME].[PROCEDURE]`
- Show loading/error states

### Backend (Express + tRPC):
- Create router: `src/server/routers/[ROUTER_NAME].ts`
- Create Service: `src/server/services/[FEATURE].service.ts`
- Create DAO: `src/server/services/[FEATURE].dao.ts`
- Data validation with Zod
- Add to main app router: `src/server/routers/_app.ts`
- Register services in: `src/server/init.ts`

### Security & Code Style:
- Use `@PermissionsGuard.PermissionRequired(['permission/name'])` decorator on methods that require permissions
- Use `@ServicesContext.inject(ServiceName)` decorator for dependency injection
- All public methods need JSDoc comments explaining purpose, parameters, and return value
- Make methods `public` when using decorators
- Use CommonJS module format (TypeScript compiles to CommonJS)
- No inline styles - use styled-components

### Tests:
- Create tests: `src/server/services/[FEATURE].service.test.ts`
- Tests run on built JavaScript: `npm test`
- Use Mocha + Chai
- Include permission tests where applicable
- Add `import 'reflect-metadata'` at top of test file

### Database (if needed):
- Update `prisma/schema.prisma` with new models
- Services should use Prisma via DatabaseService

## Code Examples to Follow:
- Public route: `src/server/routers/example.ts`
- Protected route: `src/server/routers/secured-example.ts`
- Service with permissions: `src/server/services/user.service.ts`
- DAO: `src/server/services/user.dao.ts`

## Import Guidelines:
- Backend: Can import from `@/server/*`
- Frontend: Can import ONLY from `@/shared/types` (types only, never code)
- Never mix: Frontend never imports backend code, only types

Now create the implementation for this feature.
```

---

## Real Examples

### Example 1: Simple Blog Feature

```
I need to create a blog posts feature.

## Requirements:
- Users can read posts (public)
- Only 'editor' role can create posts (permission: 'posts/create')
- Only 'editor' can delete their own posts (permission: 'posts/delete')

## Implementation:

### Frontend:
- Create page: `src/pages/blog.tsx`
- Display list of posts with titles and content
- Show "Create Post" button only if user has permission
- Link to individual post page: `src/pages/blog/[postId].tsx`

### Backend:
- Router: `src/server/routers/posts.ts`
  - `list` (public query) - return all posts
  - `getById` (public query) - return single post
  - `create` (protected mutation) - create new post with title, content
  - `delete` (protected mutation) - delete post by ID

- Service: `src/server/services/post.service.ts`
  - Methods: list(), getById(id), create(data), delete(id)
  - Use @PermissionsGuard.PermissionRequired(['posts/create']) on create()
  - Use @PermissionsGuard.PermissionRequired(['posts/delete']) on delete()

- DAO: `src/server/services/post.dao.ts`
  - Same methods as service
  - No permission decorators on DAO (permissions are in service layer)

### Database:
- Add Post model to Prisma schema

### Tests:
- Test that public can read posts
- Test that only users with 'posts/create' can create
- Test that only users with 'posts/delete' can delete

Follow code style from `src/server/services/user.service.ts` and `src/server/routers/example.ts`.
```

### Example 2: Admin Dashboard Feature

```
I need to create an admin dashboard with user management.

## Requirements:
- Only admins (role 'admin') can access
- Show list of all users
- Allow deactivating users
- Show user statistics (total users, active users)
- Permissions needed:
  - 'admin/user-read' - view user data
  - 'admin/user-write' - modify users
  - 'admin/stats-read' - view statistics

## Implementation:

### Frontend:
- Create page: `src/pages/admin/users.tsx`
- Create page: `src/pages/admin/dashboard.tsx`
- Use styled-components with Container component
- Tables for displaying user data
- Action buttons for user management

### Backend:
- Router: `src/server/routers/admin.ts`
  - `getUsers` (protected query) - return all users
  - `deactivateUser` (protected mutation)
  - `getStatistics` (protected query) - user counts

- Service: `src/server/services/admin.service.ts`
  - @PermissionsGuard.PermissionRequired(['admin/user-read']) on getUsers()
  - @PermissionsGuard.PermissionRequired(['admin/user-write']) on deactivateUser()
  - @PermissionsGuard.PermissionRequired(['admin/stats-read']) on getStatistics()

- DAO: `src/server/services/admin.dao.ts`
  - Database queries for user management

### Tests:
- Test permission enforcement on each method
- Test that unauthorized users get 401
- Test data returned by each method

Reference: `src/server/routers/secured-example.ts` for protected route structure.
```

---

## Key Concepts to Mention in Prompts

### 1. Permissions with Decorators

```typescript
// ALWAYS use decorator syntax:
@PermissionsGuard.PermissionRequired(['feature/action'])
public async methodName() {
  // No manual permission checks here
  // Decorator handles it automatically
}
```

### 2. Service Dependency Injection

```typescript
// ALWAYS use inject decorator:
export class MyService extends Service {
  @ServicesContext.inject(SomeDAO)
  private someDAO: SomeDAO;

  public async doSomething() {
    // Use this.someDAO here
  }
}
```

### 3. Frontend Styled Components

```typescript
// ALWAYS use transient props with $:
<Button $variant="primary" $size="lg">Click</Button>
<Container $maxWidth="md">Content</Container>

// NOT:
<Button variant="primary" size="lg">Click</Button>
```

### 4. tRPC Procedures

```typescript
// Use publicProcedure or protectedProcedure (never custom)
export const myRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.something.list();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.something.create(input);
    }),
});
```

### 5. Test Structure

```typescript
// Always import reflect-metadata first
import 'reflect-metadata';
import { expect } from 'chai';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should do something', async () => {
    const result = await service.doSomething();
    expect(result).to.equal('expected');
  });
});
```

---

## Prompt Checklist

Before sending your prompt, verify you have:

- [ ] Clear feature description
- [ ] List of permissions (if any)
- [ ] Frontend requirements (pages, components)
- [ ] Backend requirements (routes, services, DAOs)
- [ ] Data validation (Zod schemas)
- [ ] Test requirements
- [ ] Reference to existing code examples
- [ ] Mention of code style (decorators, transient props, CommonJS)
- [ ] Database changes needed (if any)

---

## After Generation

After AI generates the code:

1. **Review the structure:**
   - Frontend only has types from backend (in `@/shared/types`)
   - Services use `@PermissionsGuard.PermissionRequired()` decorators
   - DAOs use `@ServicesContext.inject()` decorators
   - All methods have JSDoc comments

2. **Register everything:**
   - Add service to `src/server/init.ts`
   - Add router to `src/server/routers/_app.ts`
   - Export types in `src/shared/types.ts`

3. **Test it:**
   - Run `npm run type-check` - should have no errors
   - Run `npm run build:be` - backend builds correctly
   - Run `npm run build:fe` - frontend builds correctly
   - Run `npm test` - all tests pass

4. **Check best practices:**
   - [ ] Permission checks are decorators, not manual calls
   - [ ] No React warnings about unknown props
   - [ ] No backend code imported in frontend
   - [ ] TypeScript strict mode passes
   - [ ] Tests cover permission scenarios

---

## Common Mistakes to Warn AI About

When prompting, you can add these to avoid common issues:

```
IMPORTANT:
- Don't use inline permission checks like
  `await PermissionsGuard.checkRequiredPermissions(...)`
  in service methods - use the decorator instead
- Don't pass component props like `variant` without $ prefix
- Don't import any backend code in frontend pages
- Don't forget to add `public` keyword to decorated methods
- Don't forget reflect-metadata import in tests
- Don't use ESNext modules, keep CommonJS (TypeScript handles it)
- Don't create custom procedure types, use publicProcedure or protectedProcedure
```

---

## Resources

After generation, developer should read:
- **DEVELOPMENT.md** - Complete guide with examples
- **ARCHITECTURE.md** - Understanding the layers
- **SECURITY.md** - Permission system details

Check examples in the codebase:
- `src/pages/index.tsx` - Frontend page example
- `src/server/routers/example.ts` - Public route example
- `src/server/routers/secured-example.ts` - Protected route example
- `src/server/services/user.service.ts` - Service with decorators
- `src/server/services/user.dao.ts` - DAO example
