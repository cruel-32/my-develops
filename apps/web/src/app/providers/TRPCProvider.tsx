'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCContext } from '@trpc/tanstack-react-query';

import { httpBatchLink, createTRPCClient } from '@trpc/client';
import React, { useState } from 'react';
import type { AppRouter } from '@repo/api';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_INTERNAL_APP_URL || 'http://localhost:3000';
}

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

/**
 * Token refresh state management
 * Prevents multiple simultaneous refresh requests
 */
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh access token using refresh token from cookie
 * Returns true if refresh was successful
 */
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, return the existing promise
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
        credentials: 'include', // Include refreshToken cookie
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();

      // Check if refresh was successful
      if (data?.[0]?.result?.data?.success) {
        console.log('✅ Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Custom fetch with automatic token refresh on 401
 */
async function fetchWithTokenRefresh(
  url: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> {
  // First attempt
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // If not 401, return response as is
  if (response.status !== 401) {
    return response;
  }

  console.log('🔄 401 detected, attempting token refresh...');

  // Try to refresh token
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    console.error('❌ Token refresh failed, redirecting to login...');

    // Redirect to login page if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return response; // Return original 401 response
  }

  // Retry original request with new token
  console.log('🔁 Retrying original request with new token...');
  const retryResponse = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  return retryResponse;
}

export default function TRPCProviderApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              'x-trpc-source': 'react',
            };
          },
          // ✅ Use custom fetch with automatic token refresh
          fetch: fetchWithTokenRefresh,
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
