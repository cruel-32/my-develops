'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { trpc } from '@/shared/api/index'; // Import from shared

const { TRPCProvider, trpcClient } = trpc;

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
      <TRPCProvider trpcClient={client} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
