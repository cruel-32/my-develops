'use client';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

export const clientTrpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_INTERNAL_APP_URL || 'http://localhost:3000';
}

// Token refresh logic - now handled automatically by server-side middleware

async function fetchWithTokenRefresh(
  url: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, { ...options, credentials: 'include' });

  // 401 에러가 발생한 경우에만 토큰 갱신 시도
  if (response.status !== 401) {
    return response;
  }

  // 서버 측에서 자동 토큰 갱신이 구현되었으므로,
  // 클라이언트에서는 단순히 한 번 더 재시도
  const retryResponse = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // 재시도 후에도 401이면 토큰 갱신 실패로 간주
  if (retryResponse.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  return retryResponse;
}

// Create and export the pre-configured tRPC client
export const trpcClient = clientTrpc.createClient({
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
