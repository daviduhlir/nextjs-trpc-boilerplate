# Development Guide

This guide walks you through developing new features in this boilerplate.

## Project Structure

```
src/
├── server/                 # Backend (Express + tRPC)
│   ├── index.ts           # Server entry point
│   ├── context.ts         # tRPC context
│   ├── trpc.ts            # tRPC instance
│   ├── init.ts            # Services initialization
│   ├── routers/           # tRPC routers
│   │   ├── _app.ts        # Main router
│   │   ├── example.ts     # Public example routes
│   │   └── secured-example.ts  # Protected example routes
│   ├── services/          # Business logic
│   │   ├── user.service.ts
│   │   ├── user.dao.ts    # Data access objects
│   │   └── database.service.ts
│   └── auth/
│       └── procedures.ts  # Public/Protected procedure definitions
│
├── pages/                 # Frontend (Next.js)
│   ├── _app.tsx
│   ├── index.tsx
│   └── [page].tsx
│
├── components/            # Reusable React components
│   ├── Button.tsx
│   ├── Container.tsx
│   └── index.ts
│
├── styles/               # Styling
│   ├── theme.ts          # Theme configuration
│   ├── global.ts         # Global styles
│   ├── ThemeProvider.tsx
│   └── styled.d.ts       # TypeScript theme types
│
├── utils/                # Utilities
│   └── trpc.ts          # tRPC client configuration
│
└── shared/              # Shared between BE/FE
    └── types.ts         # Type exports only
```

## Backend/Frontend Architecture

- **Backend** - Express server on port 3001 with tRPC
- **Frontend** - Next.js on port 3000
- **Communication** - HTTP via tRPC, no direct imports
- **Types** - Shared via `src/shared/types.ts` (type-only imports)

---

## 1. Creating a New Page (Frontend)

### Step 1: Create a new page file

```typescript
// src/pages/products.tsx
import styled from 'styled-components';
import { Container, Button } from '@/components';
import { trpc } from '@/utils/trpc';

/**
 * Products page
 * Displays list of products
 */
export default function ProductsPage() {
  return (
    <Container>
      <h1>Products</h1>
      {/* Page content */}
    </Container>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60,
  };
}
```

### Step 2: Add navigation

```typescript
// src/components/Navigation.tsx
import Link from 'next/link';
import styled from 'styled-components';

const Nav = styled.nav`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
`;

const NavLink = styled(Link)`
  color: white;
  margin-right: ${props => props.theme.spacing.lg};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export function Navigation() {
  return (
    <Nav>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/products">Products</NavLink>
    </Nav>
  );
}
```

### Step 3: Use styled components

```typescript
// Always use transient props (with $ prefix)
<Button $variant="primary" $size="lg">
  Click me
</Button>

<Container $maxWidth="md">
  <h1>Page Title</h1>
</Container>
```

---

## 2. Creating a New tRPC Route

### Step 1: Create a new router

```typescript
// src/server/routers/products.ts
import { router } from '../trpc';
import { publicProcedure } from '../auth/procedures';
import { z } from 'zod';

/**
 * Products router
 * Public routes for viewing products
 */
export const productsRouter = router({
  /**
   * List all products
   */
  list: publicProcedure
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    })))
    .query(async ({ ctx }) => {
      // Call service to get products
      const products = await ctx.services.product.list();
      return products;
    }),

  /**
   * Get product by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.product.getById(input.id);
    }),
});

export type ProductsRouter = typeof productsRouter;
```

### Step 2: Add router to main application

```typescript
// src/server/routers/_app.ts
import { router } from '../trpc';
import { exampleRouter } from './example';
import { productsRouter } from './products';  // NEW

/**
 * Main app router combining all feature routers
 */
export const appRouter = router({
  example: exampleRouter,
  products: productsRouter,  // NEW
});

export type AppRouter = typeof appRouter;
```

### Step 3: Use in frontend

```typescript
// src/pages/products.tsx
import { trpc } from '@/utils/trpc';

export default function ProductsPage() {
  const { data: products } = trpc.products.list.useQuery();

  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name} - ${p.price}</div>
      ))}
    </div>
  );
}
```

---

## 3. Creating a Secured Route

### Security Architecture

```
HTTP Request
    ↓
Express middleware (CORS, JSON)
    ↓
tRPC protectedProcedure middleware
    ├─ Verifies JWT token
    ├─ Extracts userId
    ├─ Extracts permissions
    └─ Calls PermissionsGuard.runWithPermissions()
    ↓
Async context (async_local_storage) - stores permissions
    ↓
Procedure handler runs service/DAO
    ↓
Service/DAO method decorated with @PermissionsGuard.PermissionRequired()
    ├─ Decorator intercepts method call
    ├─ Reads permissions from async context
    ├─ Checks if user has required permissions
    └─ Throws exception if not authorized
    ↓
Method executes with guaranteed permissions
    ↓
Returns data or error
```

**Key benefit:** Permission checks are declarative (via `@PermissionsGuard.PermissionRequired()` decorator) instead of scattered throughout method bodies. This makes it clear at a glance what permissions are required.

### Step 1: Create a secured route

```typescript
// src/server/routers/admin.ts
import { router } from '../trpc';
import { protectedProcedure } from '../auth/procedures';
import { z } from 'zod';

/**
 * Admin routes - requires authentication
 * Specific permissions are checked in service layer
 */
export const adminRouter = router({
  /**
   * List all users (requires 'admin/read' permission)
   */
  listUsers: protectedProcedure
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })))
    .query(async ({ ctx }) => {
      // PermissionsGuard.checkRequiredPermissions is called in service
      const users = await ctx.services.user.getAllUsers();
      return users;
    }),

  /**
   * Delete user (requires 'admin/delete' permission)
   */
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Permission check is performed in UserService.deleteUser()
      await ctx.services.user.deleteUser(input.userId);
      return { success: true };
    }),
});

export type AdminRouter = typeof adminRouter;
```

### Step 2: Implement service with permission checks using decorators

```typescript
// src/server/services/user.service.ts
import { Service, ServicesContext } from '@david.uhlir/services';
import { PermissionsGuard } from '@david.uhlir/permissions-guard';
import { UserDAO } from './user.dao';

/**
 * User service
 * Contains business logic with declarative permission checks via decorators
 */
export class UserService extends Service {
  @ServicesContext.inject(UserDAO)
  private userDAO: UserDAO;

  /**
   * Get all users
   * Requires 'admin/read' permission - checked via decorator
   */
  @PermissionsGuard.PermissionRequired(['admin/read'])
  public async getAllUsers() {
    // Permission check is handled by decorator above
    // No need to call checkRequiredPermissions manually
    return this.userDAO.findAll();
  }

  /**
   * Delete user
   * Requires 'admin/delete' permission - checked via decorator
   */
  @PermissionsGuard.PermissionRequired(['admin/delete'])
  public async deleteUser(userId: string) {
    // Permission check is handled by decorator above
    return this.userDAO.delete(userId);
  }

  /**
   * Update user
   * Requires 'admin/write' permission - checked via decorator
   */
  @PermissionsGuard.PermissionRequired(['admin/write'])
  public async updateUser(userId: string, data: { name?: string; email?: string }) {
    // Permission check is handled by decorator above
    return this.userDAO.update(userId, data);
  }
}
```

### Step 3: How are permissions set?

**In authentication (at request start):**

```typescript
// src/server/auth/procedures.ts
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const token = extractTokenFromHeader(ctx.req.headers);
  const decoded = verifyJWT(token); // { userId, permissions: ['admin/read', 'admin/delete'] }

  if (!decoded) throw new TRPCError({ code: 'UNAUTHORIZED' });

  // PermissionsGuard sets permissions into async_local_storage
  // All services can then read them without parameters
  return PermissionsGuard.runWithPermissions(
    decoded.permissions,
    decoded.userId,
    () => next({
      ctx: {
        ...ctx,
        userId: decoded.userId,
        permissions: decoded.permissions,
      },
    })
  );
});
```

### Step 4: Add router to application

```typescript
// src/server/routers/_app.ts
import { adminRouter } from './admin';

export const appRouter = router({
  example: exampleRouter,
  admin: adminRouter,  // NEW
});
```

### Step 5: Use in frontend

```typescript
// src/pages/admin.tsx
import { trpc } from '@/utils/trpc';

export default function AdminPage() {
  // If user is not authenticated or lacks permission,
  // API returns error and react-query handles it
  const { data: users, error, isLoading } = trpc.admin.listUsers.useQuery();

  if (error) {
    return <div>Access Denied: {error.message}</div>;
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin - Users</h1>
      {users?.map(u => (
        <div key={u.id}>{u.name} ({u.email})</div>
      ))}
    </div>
  );
}
```

---

## 4. Creating Service + DAO

### Service (Business Logic)

```typescript
// src/server/services/product.service.ts
import { Service, ServicesContext } from '@david.uhlir/services';
import { ProductDAO } from './product.dao';

/**
 * Product service
 * Business logic and validation
 */
export class ProductService extends Service {
  @ServicesContext.inject(ProductDAO)
  private productDAO: ProductDAO;

  /**
   * Get all products with filters
   */
  async list(filters?: { category?: string; minPrice?: number }) {
    // Business logic - can do transformations, validations, etc.
    let products = await this.productDAO.findAll();

    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters?.minPrice) {
      products = products.filter(p => p.price >= filters.minPrice);
    }

    return products;
  }

  /**
   * Get product by ID
   */
  async getById(id: string) {
    const product = await this.productDAO.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }
}
```

### DAO (Data Access)

```typescript
// src/server/services/product.dao.ts
import { Service, ServicesContext } from '@david.uhlir/services';
import { PermissionsGuard } from '@david.uhlir/permissions-guard';
import { DatabaseService } from './database.service';

/**
 * Product Data Access Object
 * Direct database access (Prisma) with permission decorators
 */
export class ProductDAO extends Service {
  @ServicesContext.inject(DatabaseService)
  private databaseService: DatabaseService;

  /**
   * Find all products
   */
  public async findAll() {
    const db = this.databaseService.getPrisma();
    return db.product.findMany();
  }

  /**
   * Find product by ID
   */
  public async findById(id: string) {
    const db = this.databaseService.getPrisma();
    return db.product.findUnique({ where: { id } });
  }

  /**
   * Create product
   * Requires 'product/create' permission
   */
  @PermissionsGuard.PermissionRequired(['product/create'])
  public async create(data: { name: string; price: number; category: string }) {
    const db = this.databaseService.getPrisma();
    return db.product.create({ data });
  }

  /**
   * Delete product
   * Requires 'product/delete' permission
   */
  @PermissionsGuard.PermissionRequired(['product/delete'])
  public async delete(id: string) {
    const db = this.databaseService.getPrisma();
    return db.product.delete({ where: { id } });
  }
}
```

### Register in init.ts

```typescript
// src/server/init.ts
import { ProductService } from './services/product.service';
import { ProductDAO } from './services/product.dao';

export async function initializeServices(): Promise<void> {
  console.log('[ServicesContext] Initializing services...');

  await ServicesContext.initialize([
    new DatabaseService(),
    new ProductDAO(),        // NEW
    new ProductService(),    // NEW
    new UserDAO(),
    new UserService(),
  ]);

  await ServicesContext.waitForInit();
  console.log('[ServicesContext] All services initialized successfully');
}
```

---

## 5. Testing

### Backend Test

```typescript
// src/server/services/product.service.test.ts
import 'reflect-metadata';
import { expect } from 'chai';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
  });

  describe('list', () => {
    it('should return empty array initially', () => {
      const products = service.list();
      expect(products).to.be.empty;
    });

    it('should filter by category', async () => {
      // Setup...
      const products = await service.list({ category: 'electronics' });
      expect(products).to.all.have.property('category', 'electronics');
    });
  });
});
```

### Running Tests

```bash
npm test                 # Builds and runs all tests
npm run test:watch     # Watch mode
```

---

## 6. Running the Application

### Development

```bash
npm run dev            # Runs backend (3001) and frontend (3000) in parallel
npm run dev:fe         # Frontend only
npm run dev:be         # Backend only
```

### Production

```bash
npm run build          # Builds both
npm run start          # Runs both in production mode
```

---

## 7. Best Practices

### Transient Props in Styled Components

```typescript
// ✅ CORRECT
<Button $variant="primary" $size="lg">Click</Button>
<Container $maxWidth="md">Content</Container>

// ❌ WRONG
<Button variant="primary" size="lg">Click</Button>
<Container maxWidth="md">Content</Container>
```

### Permissions

```typescript
// ✅ CORRECT - Use decorator for clean, declarative permission checks
@PermissionsGuard.PermissionRequired(['user/delete'])
public async deleteUser(userId: string) {
  return this.dao.delete(userId);
}

// ✅ ALSO CORRECT - Manual check if you need conditional logic
async deleteUser(userId: string) {
  await PermissionsGuard.checkRequiredPermissions(['user/delete']);
  return this.dao.delete(userId);
}

// ❌ WRONG - Permission check in route
const deleteUser: protectedProcedure = ...
  // Don't put logic in route, it belongs in service/DAO
```

### Imports

```typescript
// ✅ CORRECT - FE imports only types
import type { AppRouter } from '@/shared/types';

// ❌ WRONG - FE imports backend code
import { ProductService } from '@/server/services/product.service';
```

### API Errors

```typescript
// ✅ CORRECT
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Product not found',
});

// ❌ WRONG
throw new Error('Product not found');
```

---

## Useful Commands

```bash
npm run build:be       # Build backend
npm run build:fe       # Build frontend
npm run build          # Build both
npm run type-check     # TypeScript check
npm test               # Run tests
npm run format         # Format code (Prettier)
npm run lint           # ESLint
```

---

## Need Help?

Check out:
- `docs/ARCHITECTURE.md` - Detailed architecture
- `docs/SECURITY.md` - Authentication and permissions
- `src/server/routers/example.ts` - Public route example
- `src/server/routers/secured-example.ts` - Protected route example
