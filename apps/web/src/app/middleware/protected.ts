import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로 지정
const protectedRoutes = ['/dashboard', '/mypage'];

/**
 * TODO: tRPC를 REST API로 변경. 현재는 tRPC 엔드포인트 사용
 * 토큰 검증 API 호출. 성공 시 Response 객체, 실패 시 null 반환
 */
async function verifyToken(
  accessToken: string
): Promise<Response | null> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // TODO: Change to REST API endpoint (e.g., GET /api/users/verify)
    const response = await fetch(`${backendUrl}/api/trpc/users.verifyToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `accessToken=${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error('Token verification fetch failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data?.result?.data?.success) {
      console.log('✅ Token verified successfully');
      return response;
    }

    console.log('Token verification failed, error:', data?.error);
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * TODO: tRPC를 REST API로 변경. 현재는 tRPC 엔드포인트 사용
 * 백엔드에서 토큰 갱신 시도. 성공 시 Response 객체, 실패 시 null 반환
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<Response | null> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // TODO: Change to REST API endpoint (e.g., POST /api/users/refresh)
    const response = await fetch(`${backendUrl}/api/trpc/users.refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error('Token refresh fetch failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data?.result?.data?.success) {
      console.log('✅ Token refreshed successfully in middleware');
      return response;
    }

    console.log('Token refresh failed, error:', data?.error);
    return null;
  } catch (error) {
    console.error('Token refresh error in middleware:', error);
    return null;
  }
}

/**
 * 쿠키에서 토큰 추출 헬퍼 함수
 */
function extractTokensFromCookies(cookieHeader: string | undefined): {
  accessToken?: string;
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
    accessToken: cookies['accessToken'],
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

  const { accessToken, refreshToken } = extractTokensFromCookies(
    request.headers.get('cookie') || undefined
  );

  let authResponse: Response | null = null;

  // 1. 유효한 accessToken이 있는지 먼저 확인
  if (accessToken) {
    authResponse = await verifyToken(accessToken);
  }

  // 2. accessToken이 없거나 유효하지 않으면 refreshToken으로 재시도
  if (!authResponse && refreshToken) {
    console.log('🔄 Access token invalid or missing, attempting refresh...');
    authResponse = await refreshAccessToken(refreshToken);
  }

  // Scenario 1: Public-only routes (e.g., /login)
  if (isPublicOnly) {
    if (authResponse) {
      // User is authenticated
      const dashboardUrl = new URL('/dashboard', request.url);
      const response = NextResponse.redirect(dashboardUrl);
      const setCookie = authResponse.headers.get('Set-Cookie');
      if (setCookie) {
        response.headers.set('Set-Cookie', setCookie);
      }
      return response;
    }
    // User is not authenticated, allow access
    return NextResponse.next();
  }

  // Scenario 2: Protected routes (e.g., /dashboard)
  if (isProtected) {
    if (authResponse) {
      // User is authenticated
      const response = NextResponse.next();
      const setCookie = authResponse.headers.get('Set-Cookie');
      if (setCookie) {
        response.headers.set('Set-Cookie', setCookie);
      }
      return response;
    }
    // User is not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로를 설정합니다.
export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/mypage/:path*'],
};
