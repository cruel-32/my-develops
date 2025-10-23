'use server';

import { dehydrate } from '@tanstack/react-query';
import { createQueryClient } from './query-client';

/**
 * 서버 컴포넌트에서 데이터를 prefetch하고 클라이언트에 전달할 상태 생성
 *
 * @example
 * const dehydrated = await prefetchAndDehydrate({
 *   key: ['projects'],
 *   fn: async () => {
 *     const client = await createServerClient();
 *     return client.projects.list.query();
 *   }
 * });
 *
 * return (
 *   <HydrationBoundary state={dehydrated}>
 *     <Component />
 *   </HydrationBoundary>
 * );
 */
export async function prefetchAndDehydrate<T>({
  key,
  fn,
}: {
  key: (string | number | object)[];
  fn: () => Promise<T>;
}) {
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fn,
  });

  return dehydrate(queryClient);
}

/**
 * 여러 쿼리를 동시에 prefetch하고 dehydrate
 *
 * @example
 * const dehydrated = await prefetchAndDehydrateMultiple([
 *   {
 *     key: ['projects'],
 *     fn: () => client.projects.list.query(),
 *   },
 *   {
 *     key: ['users'],
 *     fn: () => client.users.list.query(),
 *   },
 * ]);
 */
export async function prefetchAndDehydrateMultiple(
  queries: Array<{
    key: (string | number | object)[];
    fn: () => Promise<any>;
  }>
) {
  const queryClient = createQueryClient();

  await Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery({
        queryKey: query.key,
        queryFn: query.fn,
      })
    )
  );

  return dehydrate(queryClient);
}
