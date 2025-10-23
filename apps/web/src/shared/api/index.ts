import { trpcClient, clientTrpc } from './trpc';

export { trpcClient, clientTrpc };

// 공통 유틸리티
export { createQueryClient } from './query-client';
export { prefetchAndDehydrate, prefetchAndDehydrateMultiple } from './hydration';

// server-trpc는 서버 컴포넌트에서만 사용 가능
// import { createServerClient } from '@/web/shared/api/server-trpc' 로 직접 import 필요
