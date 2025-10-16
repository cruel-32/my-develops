'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { trpcClient, clientTrpc } from '@/web/shared/api/index'; // Import from shared

export default function ClientTRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  // The trpcClient is now imported, not created here

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      <clientTrpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </clientTrpc.Provider>
    </QueryClientProvider>
  );
}
