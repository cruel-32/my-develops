import { createTRPCProxyClient, loggerLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) => process.env.NODE_ENV === 'development',
    }),
  ],
});
