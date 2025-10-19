# Next.js Web Application

Modern full-stack web application built with Next.js 15, React 19, and tRPC in a Turborepo monorepo.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **React**: 19.2.0 with React Compiler 1.0
- **Type Safety**: TypeScript 5.9 + tRPC 11.6
- **State Management**: TanStack Query (React Query) 5.90
- **Styling**: Tailwind CSS 4.1
- **Monorepo**: Turborepo with pnpm workspaces
- **Architecture**: Feature-Sliced Design

## 📋 Prerequisites

- **Node.js**: >=22
- **pnpm**: 10.18.3+ (managed by packageManager field)
- **Docker**: (optional) for containerized development

## 🏗️ Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── entities/         # Business entities
│   ├── features/         # Feature modules
│   ├── shared/           # Shared utilities
│   │   ├── api/          # API clients (tRPC)
│   │   ├── actions/      # Server Actions
│   │   └── ui/           # UI components
│   └── widgets/          # Composite UI components
├── next.config.ts        # Next.js configuration
└── package.json
```

## 🛠️ Getting Started

### Installation

```bash
# Install dependencies (from repository root)
pnpm install
```

### Environment Setup

Create `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydevelops

# Backend API
NODE_ENV=development
PORT=4000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
INTERNAL_API_URL=http://localhost:4000/trpc
NEXT_INTERNAL_APP_URL=http://localhost:3000
```

### Development

```bash
# Start development server (from repository root)
pnpm dev

# Or filter specific app
turbo dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Build all apps
pnpm build

# Build web app only
turbo build --filter=web
```

### Production

```bash
# Start production server
pnpm start

# Or filter specific apps
turbo start --filter=web --filter=backend
```

## 🐳 Docker Deployment

### Development Mode

```bash
# Build development images
pnpm docker:build:dev

# Start development containers
pnpm docker:up:dev

# View logs
pnpm docker:logs:dev

# Stop containers
pnpm docker:down:dev
```

### Production Mode

```bash
# Build production images
pnpm docker:build:prod

# Start production containers
pnpm docker:up:prod

# View logs
pnpm docker:logs:prod

# Stop containers
pnpm docker:down:prod
```

For detailed Docker documentation, see [DOCKER_README.md](../../DOCKER_README.md).

## 🔧 Available Scripts

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Run TypeScript type checking

### Docker Commands

- `pnpm docker:build` - Build Docker images
- `pnpm docker:build:dev` - Build development images
- `pnpm docker:build:prod` - Build production images
- `pnpm docker:up` - Start containers
- `pnpm docker:down` - Stop containers
- `pnpm docker:logs` - View container logs
- `pnpm docker:restart` - Restart containers
- `pnpm docker:status` - Check container status

### Code Quality

- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm steiger` - Analyze Feature-Sliced Design architecture

## 🏛️ Architecture

### Feature-Sliced Design

This project follows [Feature-Sliced Design](https://feature-sliced.design/) methodology:

- **app/**: Application initialization and routing
- **widgets/**: Composite UI components (e.g., ProjectList)
- **features/**: User-facing features (e.g., projectForm, createProjectButton)
- **entities/**: Business entities (e.g., project, user)
- **shared/**: Reusable utilities and components

### tRPC Integration

#### Server Components (Recommended)

Server components call the backend API directly using `serverTrpc`:

```typescript
import { serverTrpc } from '@/web/shared/api/server-trpc';

export default async function Page() {
  // Direct backend API call with caching
  const projects = await serverTrpc.projects.list(undefined, {
    tags: ['projects'],      // Cache tags for revalidation
    revalidate: 300,          // Revalidate every 5 minutes
  });

  return <div>{/* render projects */}</div>;
}
```

#### Client Components

Client components use `clientTrpc` with React Query:

```typescript
'use client';

import { clientTrpc } from '@/web/shared/api';

export function Component() {
  const { data, isPending } = clientTrpc.projects.list.useQuery();

  return <div>{/* render data */}</div>;
}
```

#### Cache Invalidation

Use Server Actions to invalidate server component caches:

```typescript
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateProjects() {
  revalidatePath('/dashboard');
  revalidateTag('projects');
}
```

Call from client components:

```typescript
import { revalidateProjects } from './actions';

const mutation = clientTrpc.projects.create.useMutation({
  onSuccess: async () => {
    await revalidateProjects(); // Invalidate server cache
  },
});
```

### React Compiler 1.0

This project uses React Compiler 1.0 for automatic optimization. The compiler automatically memoizes components and values, eliminating the need for manual `useMemo`, `useCallback`, and `memo`.

**Configuration** (next.config.ts):
```typescript
experimental: {
  reactCompiler: true, // Full mode - all components optimized
}
```

**Benefits**:
- Automatic memoization without manual optimization
- Improved performance and reduced re-renders
- Cleaner code without memoization boilerplate

## 📦 Workspace Packages

- `@repo/api` - Backend API types and tRPC router
- `@repo/ui` - Shared UI component library
- `@repo/db` - Database schema and client
- `@repo/eslint-config` - Shared ESLint configuration
- `@repo/typescript-config` - Shared TypeScript configuration
- `@repo/tailwind-config` - Shared Tailwind CSS configuration

## 🔍 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19)
- [tRPC Documentation](https://trpc.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Compiler](https://react.dev/learn/react-compiler)

## 📝 Additional Documentation

- [Docker Deployment Guide](../../DOCKER_README.md)
- [Token Strategy](../../TOKEN_STRATEGY.md)

## 🚢 Deployment

The application is configured for standalone deployment with Docker. See the Docker commands section above for containerized deployment.

For detailed production deployment instructions, refer to [DOCKER_README.md](../../DOCKER_README.md).
