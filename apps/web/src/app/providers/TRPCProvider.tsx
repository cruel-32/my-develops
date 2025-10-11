'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { trpc } from '@/web/shared/api/index'; // Import from shared

const {
  trpc: { Provider },
  trpcClient,
} = trpc;

export default function TRPCProviderApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  // The trpcClient is now imported, not created here
  const [client] = useState(() => trpcClient);

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      <Provider client={client} queryClient={queryClient}>
        {children}
      </Provider>
    </QueryClientProvider>
  );
}
