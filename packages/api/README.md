# @repo/api

Automatically generated API client hooks and TypeScript types from the OpenAPI/Swagger specification.

## Overview

This package provides:

- **React Query Hooks** - Type-safe mutations and queries for all API endpoints
- **TypeScript Types** - Complete type definitions for requests and responses
- **Zod Schemas** - Runtime validation schemas for all API data structures

All three are **automatically generated** from `apps/backend/src/swagger-output.json` using [Kubb](https://kubb.dev).

## Installation

```bash
pnpm add @repo/api
```

## Usage

### React Query Mutations (POST, PUT, DELETE)

```typescript
import { usePostApiAuthLogin } from '@repo/api';

export function LoginForm() {
  const { mutate, isPending } = usePostApiAuthLogin({
    onSuccess: (data) => {
      console.log('Login successful:', data);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleLogin = (email: string, password: string) => {
    mutate({ email, password });
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      {isPending ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### React Query Queries (GET)

```typescript
import { useGetApiProjectsList } from '@repo/api';

export function ProjectsList() {
  const { data, isLoading, error } = useGetApiProjectsList();

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### Type Safety

All generated functions have full TypeScript type inference:

```typescript
import type { PostApiAuthLoginMutationRequest, PostApiAuthLoginMutationResponse } from '@repo/api';

// Request type is automatically inferred
const { mutate } = usePostApiAuthLogin();

// This will show a type error if the data doesn't match the schema
mutate({
  email: 'user@example.com', // ✅ Correct
  password: 'secure-password',
});

// TypeScript error: Property 'email' is required
mutate({ password: 'secure-password' });
```

## Available Hooks

All endpoint hooks follow the naming pattern: `use<METHOD>Api<PATH>`

### Authentication

- `usePostApiAuthLogin` - Login
- `usePostApiAuthSignup` - Sign up
- `usePostApiAuthRefresh` - Refresh token
- `usePostApiAuthVerifyToken` - Verify token
- `usePostApiAuthLogout` - Logout
- `usePostApiAuthChangePassword` - Change password

### Projects

- `usePostApiProjectsCreate` - Create project
- `useGetApiProjectsList` - List projects
- `useGetApiProjectsId` - Get project details
- `usePutApiProjectsUpdate` - Update project
- `useDeleteApiProjectsDelete` - Delete project

### Users

- `useGetApiUsersMe` - Get current user
- `useGetApiUsersList` - List all users
- `useGetApiUsersId` - Get user details
- `usePutApiUsersUpdate` - Update user
- `useDeleteApiUsersDelete` - Delete user

### Images

- `usePostApiImagesUpload` - Upload image
- `useGetApiImagesList` - List images
- `useGetApiImagesImgid` - Get image details
- `useDeleteApiImagesImgid` - Delete image

### Operator Roles

- `usePostApiOperatorRolesCreate` - Create role assignment
- `useGetApiOperatorRolesList` - List role assignments
- `useDeleteApiOperatorRolesDelete` - Delete role assignment

## Suspense Queries

For each GET endpoint, there's also a Suspense version:

```typescript
import { useGetApiProjectsListSuspense } from '@repo/api';

export function ProjectsList() {
  const { data } = useGetApiProjectsListSuspense();

  return (
    <ul>
      {data?.projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}

// Wrap with Suspense boundary
<Suspense fallback={<div>Loading projects...</div>}>
  <ProjectsList />
</Suspense>
```

## Regenerating from Updated API Spec

### Automatic (Recommended)

The API client is **automatically regenerated** when you commit changes to the swagger spec:

```bash
# Just commit your backend API changes
git add apps/backend/src/swagger-output.json
git commit -m "Update API spec"  # ← kubb runs automatically
```

The **pre-commit hook** checks if `swagger-output.json` changed and runs kubb automatically.

### Manual Regeneration

For quick development, use watch mode:

```bash
# Terminal 1: Start development with auto-regeneration
pnpm api:generate:watch

# Terminal 2: Start your dev server
pnpm dev
```

Or generate once:

```bash
# Generate once
pnpm api:generate
```

This will:
1. Read `apps/backend/src/swagger-output.json`
2. Regenerate all hooks, types, and schemas in `packages/api/src/generated`
3. Auto-export everything through `packages/api/src/index.ts`

## Configuration

Kubb configuration is in `kubb.config.ts` at the monorepo root:

```typescript
{
  input: {
    path: './apps/backend/src/swagger-output.json',
  },
  output: {
    path: './packages/api/src/generated',
  },
  plugins: [
    pluginOas(),
    pluginTs(),
    pluginReactQuery({
      infinite: { queryParam: 'page', initialPageParam: 0 },
    }),
  ],
}
```

## Advanced Usage

### Runtime Validation with Zod Schemas

Validate data at runtime using the auto-generated Zod schemas:

```typescript
import { postApiAuthLoginMutationRequestSchema, postApiAuthLoginMutationResponseSchema } from '@repo/api';
import { usePostApiAuthLogin } from '@repo/api';

// Validate request data
const loginData = { email: 'user@example.com', password: 'password' };
const validatedRequest = postApiAuthLoginMutationRequestSchema.parse(loginData);

// Validate API response
const { mutate } = usePostApiAuthLogin({
  onSuccess: (data) => {
    // Parse response with schema
    const validatedResponse = postApiAuthLoginMutationResponseSchema.parse(data);
    console.log('Token:', validatedResponse.accessToken);
  },
});
```

### Safe Parsing (No Errors)

```typescript
import { postApiAuthLoginMutationRequestSchema } from '@repo/api';

const result = postApiAuthLoginMutationRequestSchema.safeParse(userInput);

if (!result.success) {
  // Handle validation errors
  console.error('Validation failed:', result.error.flatten());
} else {
  // Use validated data safely
  mutate(result.data);
}
```

### Custom Query Options

```typescript
import { useGetApiProjectsList, getApiProjectsListQueryOptions } from '@repo/api';
import { useQuery } from '@tanstack/react-query';

// Use custom query options
const { data } = useQuery({
  ...getApiProjectsListQueryOptions(),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10,    // 10 minutes
});
```

### Mutation Options

```typescript
import { usePostApiProjectsCreate, postApiProjectsCreateMutationOptions } from '@repo/api';
import { useMutation } from '@tanstack/react-query';

const { mutate } = useMutation(postApiProjectsCreateMutationOptions());
```

## Best Practices

1. **Always use TypeScript** - Let TypeScript catch API contract violations at compile time
2. **Handle errors properly** - Use `onError` callbacks and error boundaries
3. **Set appropriate cache times** - Adjust `staleTime` and `gcTime` based on your needs
4. **Use Suspense for better UX** - Use Suspense queries with error boundaries for streaming rendering
5. **Invalidate queries on mutations** - Manually invalidate related queries for consistency

```typescript
const queryClient = useQueryClient();

const { mutate } = usePostApiProjectsCreate({
  onSuccess: () => {
    // Invalidate projects list to refetch
    queryClient.invalidateQueries({ queryKey: ['GetApiProjectsList'] });
  },
});
```

## Troubleshooting

### "Cannot find module" errors

Ensure the package is properly installed:

```bash
pnpm install
```

### Type errors in generated code

If you see TypeScript errors in the generated code, try:

```bash
# Regenerate
pnpm exec kubb

# Clean build
rm -rf packages/api/dist node_modules/.cache

# Rebuild
pnpm --filter @repo/api build
pnpm check-types
```

## License

MIT
