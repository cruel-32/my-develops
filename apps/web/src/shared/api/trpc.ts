'use client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { httpBatchLink, createTRPCClient } from '@trpc/client';
import type { AppRouter } from '@repo/api';

// Export the context hooks first
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_INTERNAL_APP_URL || 'http://localhost:3000';
}

// Token refresh logic
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/trpc/user.refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trpc-source': 'react',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data?.[0]?.result?.data?.success ?? false;
    } catch (error) {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function fetchWithTokenRefresh(
  url: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (response.status !== 401) {
    return response;
  }
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return response;
  }
  return await fetch(url, { ...options, credentials: 'include' });
}

// Create and export the pre-configured tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          'x-trpc-source': 'react',
        };
      },
      fetch: fetchWithTokenRefresh,
    }),
  ],
});
