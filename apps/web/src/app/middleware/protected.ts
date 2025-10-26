import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로 지정
const protectedRoutes = ['/mypage'];

/**
 * 쿠키에서 refreshToken 추출 헬퍼 함수
 */
function extractTokensFromCookies(cookieHeader: string | undefined): {
  refreshToken?: string;
} {
  if (!cookieHeader) return {};
  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );
  return {
    refreshToken: cookies['refreshToken'],
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicOnlyRoutes = ['/', '/login'];
  const isPublicOnly = publicOnlyRoutes.includes(pathname);
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));

  if (!isPublicOnly && !isProtected) {
    return NextResponse.next();
  }

  const { refreshToken } = extractTokensFromCookies(
    request.headers.get('cookie') || undefined
  );

  /**
   * 인증 상태 판단:
   * - accessToken: localStorage에 저장 (클라이언트에서만 접근 가능)
   * - refreshToken: HTTP-only 쿠키에 저장 (서버에서 접근 가능)
   *
   * 미들웨어는 서버사이드에서 실행되므로 refreshToken만 확인합니다.
   * refreshToken이 있으면 사용자가 인증된 것으로 간주합니다.
   */
  const isAuthenticated = !!refreshToken;

  // Scenario 1: Public-only routes (e.g., /login)
  if (isPublicOnly) {
    if (isAuthenticated) {
      // User is authenticated, redirect to project
      const projectUrl = new URL('/project', request.url);
      return NextResponse.redirect(projectUrl);
    }
    // User is not authenticated, allow access to login page
    return NextResponse.next();
  }

  // Scenario 2: Protected routes (e.g., /project)
  if (isProtected) {
    if (isAuthenticated) {
      // User is authenticated, allow access
      return NextResponse.next();
    }
    // User is not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('backUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로를 설정합니다.
export const config = {
  matcher: ['/', '/login', '/project/:path*', '/mypage/:path*'],
};
