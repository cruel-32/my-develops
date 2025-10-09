import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로 지정
const protectedRoutes = ['/dashboard', '/mypage'];

/**
 * tRPC를 통해 토큰 검증
 */
async function verifyTokenViaTRPC(accessToken: string): Promise<boolean> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/trpc/user.verifyToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trpc-source': 'middleware',
        Cookie: `accessToken=${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error('Token verification failed:', response.status);
      return false;
    }

    const data = await response.json();

    // 검증 성공 여부 확인
    if (data?.[0]?.result?.data?.success) {
      console.log('✅ Token verified successfully via tRPC');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token verification error via tRPC:', error);
    return false;
  }
}

/**
 * 백엔드에서 토큰 갱신 시도
 */
async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/trpc/user.refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trpc-source': 'middleware',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return false;
    }

    const data = await response.json();

    // 갱신 성공 여부 확인
    if (data?.[0]?.result?.data?.success) {
      console.log('✅ Token refreshed successfully in middleware');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error in middleware:', error);
    return false;
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
  console.log('protectedMiddleware :::: ', request.nextUrl);
  const { pathname } = request.nextUrl;

  // 보호 경로가 아니면 통과
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // 1. 인증 토큰 쿠키를 확인합니다.
  const { accessToken, refreshToken } = extractTokensFromCookies(
    request.headers.get('cookie') || undefined
  );

  console.log('accessToken :::: ', accessToken ? 'present' : 'missing');
  console.log('refreshToken :::: ', refreshToken ? 'present' : 'missing');

  // 2. 토큰이 없으면 로그인 페이지로 리디렉션합니다.
  if (!accessToken || !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. tRPC를 통해 AccessToken 유효성 검증
  const isTokenValid = await verifyTokenViaTRPC(accessToken);

  if (isTokenValid) {
    // ✅ 토큰이 유효하면 요청을 그대로 진행
    console.log('✅ Valid access token via tRPC, proceeding...');
    return NextResponse.next();
  }

  // 4. AccessToken이 유효하지 않으면 RefreshToken으로 갱신 시도
  console.log('🔄 Access token invalid, attempting refresh...');
  const refreshSuccess = await refreshAccessToken(refreshToken);

  if (refreshSuccess) {
    // ✅ 토큰 갱신 성공 - 요청을 그대로 진행 (새 토큰은 쿠키에 설정됨)
    console.log('✅ Token refreshed, proceeding with request...');
    return NextResponse.next();
  }

  // 5. 토큰 갱신 실패 - 로그인 페이지로 리디렉션
  console.log('❌ Token refresh failed, redirecting to login...');
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// 미들웨어를 적용할 경로를 설정합니다.
export const config = {
  /*
   * 아래 경로들을 제외한 모든 경로와 일치시킵니다:
   * - api (API 라우트)
   * - _next/static (정적 파일)
   * - _next/image (이미지 최적화 파일)
   * - favicon.ico (파비콘 파일)
   * - /login (로그인 페이지 자체 - 무한 리디렉션 방지)
   *
   * 보호하고 싶은 특정 경로만 지정하려면 아래와 같이 설정할 수 있습니다.
   * matcher: ['/dashboard/:path*', '/profile/:path*']
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
