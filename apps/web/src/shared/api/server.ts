import { cookies } from 'next/headers';

/**
 * Server Component에서 API 호출 시 필요한 설정을 반환합니다.
 * 쿠키(인증 토큰)를 백엔드로 전달하기 위해 사용합니다.
 *
 * 사용 예시:
 * ```ts
 * import { getApiProjects } from '@repo/api/hooks';
 * import { getServerApiConfig } from '@/web/shared/api/server';
 *
 * export default async function Page() {
 *   const config = await getServerApiConfig();
 *   const projects = await getApiProjects(config);
 *   // ...
 * }
 * ```
 */
export async function getServerApiConfig() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  return {
    headers: {
      Cookie: cookieString,
    },
  };
}
