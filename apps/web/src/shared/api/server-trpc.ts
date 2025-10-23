'use server';

import { cache } from 'react';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { cookies } from 'next/headers';
import type { AppRouter } from '@repo/api';

/**
 * Next.js 캐싱 옵션
 */
export type CacheOptions = {
  /**
   * 재검증 시간 (초)
   * - number: 해당 시간(초) 후 재검증
   * - false: 캐시 사용 안 함 (no-store)
   * - undefined: 기본값 (300초 = 5분)
   */
  revalidate?: number | false;
  /**
   * 캐시 태그 (재검증 시 사용)
   */
  tags?: string[];
};

/**
 * 내부 캐시된 클라이언트 팩토리
 */
const createCachedClient = cache(async (options?: CacheOptions) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/trpc`,
        headers: {
          cookie: cookieHeader,
          'x-trpc-source': 'nextjs-server',
          'Content-Type': 'application/json',
        },
        // Next.js fetch 옵션 적용
        fetch: (url, opts) => {
          return fetch(url, {
            ...opts,
            next: {
              revalidate: options?.revalidate ?? 300, // 기본 5분
              tags: options?.tags,
            },
            cache: options?.revalidate === false ? 'no-store' : undefined,
          });
        },
      }),
    ],
  });
});

/**
 * 서버 컴포넌트용 tRPC 클라이언트 팩토리
 * - API 서버(4000번)로 직접 호출
 * - AppRouter 타입 자동 추론
 * - React cache()로 중복 호출 방지
 * - Next.js fetch 캐싱 옵션 지원
 *
 * @param options - Next.js 캐싱 옵션
 * @returns tRPC Proxy Client (완벽한 타입 추론)
 *
 * @example
 * // 기본 사용 (5분 캐싱)
 * const trpc = await createServerClient();
 * const projects = await trpc.projects.list.query();
 *
 * @example
 * // 커스텀 캐싱
 * const trpc = await createServerClient({ revalidate: 60 });
 * const projects = await trpc.projects.list.query();
 *
 * @example
 * // 캐시 사용 안 함
 * const trpc = await createServerClient({ revalidate: false });
 * const projects = await trpc.projects.list.query();
 */
export async function createServerClient(options?: CacheOptions) {
  return await createCachedClient(options);
}
