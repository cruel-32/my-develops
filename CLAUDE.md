# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My Develops** - 개발팀을 위한 협업 다이어그램 플랫폼 (Collaborative Diagram Platform for Development Teams)

A self-hosted, real-time ERD and diagram editor platform. Built with Next.js 15, React 19, React Compiler 1.0, tRPC, and PostgreSQL in a Turborepo monorepo architecture using Feature-Sliced Design.

**Status**: MVP development (5% complete)
**Tech Stack**: Next.js 15.5.4, React 19.2.0, tRPC 11.6.0, Drizzle ORM 0.44.6, PostgreSQL 17
**Architecture**: Turborepo monorepo with Feature-Sliced Design (FSD)

## Development Commands

### Initial Setup
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with proper configuration

# Start PostgreSQL
docker-compose up -d postgres

# Run database migrations
pnpm --filter @repo/db db:migrate

# Seed initial data
pnpm --filter @repo/db db:seed
```

### Development
```bash
# Start all services in parallel (web + backend)
pnpm dev
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:4000

# Start specific service
pnpm --filter web dev
pnpm --filter backend dev

# Build all packages (with Turborepo caching)
pnpm build

# Start production servers
pnpm start
```

### Database Operations
```bash
# Run migrations
pnpm --filter @repo/db db:migrate

# Seed database
pnpm --filter @repo/db db:seed

# Generate new migration
pnpm --filter @repo/db db:generate

# Open Drizzle Studio (database GUI)
pnpm --filter @repo/db db:studio
```

### Code Quality
```bash
# Run ESLint across all packages
pnpm lint

# Type check all packages
pnpm check-types

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check

# Check Feature-Sliced Design architecture compliance
pnpm steiger
```

### Testing
```bash
# Run unit tests (Jest)
pnpm test:unit

# Run E2E tests (Playwright)
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e --ui

# Run specific test file
pnpm --filter web test path/to/test.spec.ts
```

### Docker Deployment
```bash
# Build production images
pnpm docker:build:prod

# Start production stack (web + backend + postgres)
pnpm docker:up:prod

# Stop containers
pnpm docker:down

# View logs
pnpm docker:logs

# Check service health
pnpm docker:status

# Restart services
pnpm docker:restart
```

## Architecture

### Monorepo Structure

```
/
├── apps/
│   ├── web/              # Next.js 15 frontend (App Router)
│   └── backend/          # tRPC API server (Express)
└── packages/
    ├── api/              # tRPC routers, controllers, services
    ├── db/               # Database schema, migrations, seed data
    ├── ui/               # Shared React components
    ├── eslint-config/    # Shared ESLint rules
    ├── typescript-config/ # Shared TypeScript config
    └── tailwind-config/  # Shared Tailwind tokens
```

### Feature-Sliced Design Architecture

The web app (`apps/web/src`) follows Feature-Sliced Design methodology with strict layering:

```
apps/web/src/
├── app/           # Application layer: providers, middleware, global styles
│   ├── providers/ # React Query, tRPC, Theme providers
│   ├── middleware/ # Next.js middleware (auth, etc.)
│   └── styles/    # Global CSS, Tailwind imports
├── pages/         # Page compositions (routing level)
├── widgets/       # Complex UI blocks composed of features
├── features/      # Business logic units (e.g., loginForm, joinForm)
│   └── [feature]/
│       ├── ui/    # Feature components
│       ├── model/ # State, schemas, hooks
│       └── api/   # tRPC mutations/queries
├── entities/      # Domain models (user, project, etc.)
└── shared/        # Reusable utilities, UI components, configs
    ├── api/       # tRPC client setup
    ├── ui/        # Basic UI components
    ├── lib/       # Utility functions
    └── config/    # App configuration
```

**Dependency Rules (enforced by @feature-sliced/steiger-plugin)**:
- Layers can only import from layers below them
- app → pages → widgets → features → entities → shared
- Cross-imports within the same layer are forbidden
- Run `pnpm steiger` to validate architecture compliance

### API Layer Architecture

The `@repo/api` package organizes backend logic by domain modules:

```
packages/api/src/
├── trpc.ts           # tRPC context, middleware, router factory
├── router.ts         # Root router (combines all module routers)
└── modules/          # Domain-specific modules
    ├── users/
    │   ├── routes.ts      # tRPC procedures (signUp, login, etc.)
    │   ├── controllers.ts # Request/response handling
    │   ├── services.ts    # Business logic
    │   └── interfaces.ts  # TypeScript types
    ├── projects/
    ├── operator_roles/
    └── images/
```

**Pattern**: Each module exports a router that gets merged into `appRouter` in `router.ts`. This provides end-to-end type safety from client to server.

### Database Architecture

**ORM**: Drizzle ORM with PostgreSQL
**Schema Location**: `packages/db/src/schema/`

**Key Tables**:
- `users` - User accounts and authentication
- `roles` - Access control roles
- `projects` - Main project entities
- `operator_roles` - User-project-role relationships (many-to-many)
- `canvases` - Base canvas data for all diagram types
- `erd_canvases` - ERD-specific canvas data
- `erd_nodes` - ERD table entities
- `node_fields` - ERD table columns/fields
- `diagram_posts` - General diagram data (non-ERD)
- `enums` - Shared enum types

**Migration Workflow**:
1. Modify schema files in `packages/db/src/schema/`
2. Generate migration: `pnpm --filter @repo/db db:generate`
3. Review generated SQL in `packages/db/src/migrations/`
4. Apply migration: `pnpm --filter @repo/db db:migrate`

### Type Safety Flow

**End-to-End Type Safety via tRPC**:

1. Define Zod schemas in features or API modules
2. Create tRPC procedures in `packages/api/src/modules/*/routes.ts`
3. Export `AppRouter` type from `packages/api/src/router.ts`
4. Frontend gets automatic type inference via `createTRPCReact<AppRouter>()`

**Example**:
```typescript
// Backend (packages/api/src/modules/users/routes.ts)
export const usersRouter = router({
  signUp: publicProcedure
    .input(signUpSchema)  // Zod validation
    .mutation(({ input }) => {
      // TypeScript knows input structure from schema
    }),
});

// Frontend (apps/web/src/features/joinForm/api/useSignUp.ts)
const { mutate } = clientTrpc.users.signUp.useMutation();
// TypeScript auto-completes available procedures and validates input types
```

## Key Technologies & Patterns

### React Compiler 1.0

**Enabled globally** in `apps/web/next.config.ts`:
```typescript
experimental: {
  reactCompiler: true,
}
```

**Benefit**: Automatic memoization at compile time - no need for manual `useMemo`, `useCallback`, or `memo` in most cases.

**When writing components**: Write clean, simple code. The compiler will optimize automatically.

### Authentication System

**Implementation**: JWT-based with refresh token rotation
- Access tokens: Short-lived, stored in httpOnly cookies
- Refresh tokens: Longer-lived, automatic rotation on refresh
- Token refresh: Automatic retry on 401 responses (see `apps/web/src/shared/api/trpc.ts`)

**Protected Routes**: Implemented via Next.js middleware in `apps/web/src/app/middleware/`

**Key Files**:
- Auth service: `packages/api/src/modules/users/services.ts`
- JWT utilities: `packages/api/src/lib/jwt.ts`
- Frontend auth state: `apps/web/src/shared/api/trpc.ts`

### Form Handling Pattern

**Stack**: React Hook Form + Zod + tRPC

**Standard Pattern** (see `apps/web/src/features/loginForm/` for reference):
```typescript
// 1. Define schema with Zod
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Use zodResolver in form
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

// 3. tRPC mutation handles validated data
const { mutate } = clientTrpc.users.login.useMutation();
```

### Environment Variables

**Backend** (.env in root):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/mydevelops
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=4000
```

**Frontend** (Next.js env vars):
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_INTERNAL_APP_URL=http://localhost:3000  # For SSR API calls
```

## Code Conventions

### Import Aliases

```typescript
// Web app (apps/web/)
import { Button } from '@/web/shared/ui/button';
import { loginSchema } from '@/web/features/loginForm/model/schema';

// Backend app (apps/backend/)
import { db } from '@/be/db';

// Shared packages
import { appRouter } from '@repo/api';
import { users } from '@repo/db';
import { Button } from '@repo/ui';
```

### TypeScript Configuration

- **Strict mode enabled** across all packages
- **Path aliases** configured in each package's `tsconfig.json`
- **Shared configs** via `@repo/typescript-config`

### Testing Conventions

**Unit Tests** (Jest + React Testing Library):
- Location: `__tests__/` directory next to the component/feature
- Pattern: `*.test.ts` or `*.test.tsx`
- Example: `apps/web/src/features/loginForm/__tests__/loginForm.test.tsx`

**E2E Tests** (Playwright):
- Location: `/e2e/` directory at monorepo root
- Pattern: `*.spec.ts`
- Base URL: `http://localhost:3000`
- Example: `/e2e/login.spec.ts`

**Run single test**:
```bash
# Jest
pnpm --filter web test path/to/test.test.ts

# Playwright
pnpm test:e2e --grep "test name"
```

## Current Implementation Status

### Completed
- JWT authentication system with refresh tokens
- User registration and login flows
- Project CRUD operations
- Database schema with 10 tables
- tRPC API layer with type-safe client
- Feature-Sliced Design architecture
- Docker multi-stage builds for production
- React Compiler integration

### In Progress
- User management features
- ERD editor UI (@xyflow/react integration)
- Real-time collaboration (WebSocket/Server-Sent Events)

### Planned
- Test coverage (currently minimal)
- Error tracking and structured logging
- Performance optimization (caching, code splitting)
- ERD to SQL DDL export
- Member invitation system
- Role-based access control UI

## Important Notes

### Build Configuration Workarounds

**Note**: `apps/web/next.config.ts` has `ignoreBuildErrors` and `ignoreDuringBuilds` set to `true` temporarily. This is to allow rapid development iteration. **Remove these in production**.

### Turborepo Caching

- First build: ~45 seconds
- Cached build: ~8 seconds (82% faster)
- Cache invalidation: Automatic based on file changes and dependencies
- Clear cache: `rm -rf node_modules/.cache/turbo`

### Package Manager

**MUST use pnpm** (version >= 10.18.3):
- Specified in `package.json` via `packageManager` field
- Faster installs and disk-efficient via hard links
- Workspace protocol for internal package dependencies

### Node Version

**Requirement**: Node.js >= 22
- Specified in `package.json` engines field
- Use nvm/fnm to manage versions: `nvm use` or `fnm use`

## Troubleshooting

### Database Connection Issues
```bash
# Ensure PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port Conflicts
- Frontend: 3000
- Backend: 4000
- PostgreSQL: 5432
- Drizzle Studio: 4983

### Type Errors After Schema Changes
```bash
# Rebuild API package to regenerate types
pnpm --filter @repo/api build

# Rebuild DB package
pnpm --filter @repo/db build

# Type check everything
pnpm check-types
```

### Turborepo Cache Issues
```bash
# Clear Turborepo cache
rm -rf node_modules/.cache/turbo

# Force rebuild without cache
turbo run build --force
```
