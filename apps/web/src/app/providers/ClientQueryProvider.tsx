'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

/**
 * React Query Provider 래퍼
 * tRPC 대신 fetch + React Query 방식으로 변경
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0, // 재시도 비활성화
        staleTime: 60 * 1000, // 1분간 데이터 유지 (SSR/Hydration 시 즉시 재요청 방지)
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function ClientQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: Avoid useState when initializing the query client if you are
  //       rendering this component on the server. If you use useState,
  //       the query client will be created on the server but PLEASE NOTE
  //       that THIS IS NOT THE RECOMMENDED WAY TO DO SSR WITH REACT QUERY.
  //       See https://tanstack.com/query/v5/docs/react/ssr
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      {children}
    </QueryClientProvider>
  );
}
