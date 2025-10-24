/**
 * @repo/api - Automatically generated API client hooks, types, and schemas
 *
 * This package provides:
 * - Type-safe React Query hooks for all API endpoints
 * - TypeScript types for requests and responses
 * - Zod schemas for runtime validation
 *
 * Usage:
 * import { usePostApiAuthLogin, PostApiAuthLoginMutationRequest, postApiAuthLoginMutationRequestSchema } from '@repo/api';
 *
 * const { mutate } = usePostApiAuthLogin({
 *   onSuccess: (data) => console.log(data),
 * });
 *
 * mutate({ email: 'user@example.com', password: 'password' });
 */

// Re-export all generated hooks and types
export * from './generated/index.js';

// Re-export all Zod schemas
export * from './generated/zod/index.js';
