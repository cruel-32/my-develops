# HttpOnly Cookie 구현 가이드

## 🎯 방법 1: HttpOnly Cookie (추천)

---

## 1. Backend 수정

### 1.1 Cookie 설정 유틸리티 생성

```typescript
// apps/backend/src/lib/cookie.ts
import type { Context } from '@trpc/server';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15분
};

export const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
};

// tRPC context에 cookie 설정 추가 필요
export function setAuthCookies(
  response: any, // HTTP Response 객체
  accessToken: string,
  refreshToken: string
) {
  response.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; ${serializeCookie(ACCESS_TOKEN_OPTIONS)}`,
    `refreshToken=${refreshToken}; ${serializeCookie(REFRESH_TOKEN_OPTIONS)}`,
  ]);
}

function serializeCookie(options: typeof COOKIE_OPTIONS) {
  const parts = [];
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge / 1000}`);
  return parts.join('; ');
}
```

### 1.2 Login Controller 수정

```typescript
// apps/backend/src/modules/users/controllers.ts
export const loginController = async ({ input, ctx }: any) => {
  const { email, password } = input;

  // 사용자 인증 로직
  const user = await authenticateUser(email, password);

  // JWT 토큰 생성
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // ✅ Cookie 설정
  setAuthCookies(ctx.res, accessToken, refreshToken);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};
```

### 1.3 CORS 설정

```typescript
// apps/backend/src/index.ts
import cors from 'cors';

const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: cors({
    origin: 'http://localhost:3000', // Next.js URL
    credentials: true, // ✅ Cookie 허용
  }),
});
```

---

## 2. Next.js Proxy 수정

### 2.1 Cookie 전달 처리

```typescript
// apps/web/src/app/api/trpc/[trpc]/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trpc: string }> }
) {
  try {
    const { trpc } = await params;
    const body = await request.text();

    // ✅ Cookie 추출
    const cookies = request.headers.get('cookie') || '';

    const response = await fetch(`${BACKEND_URL}/${trpc}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trpc-source': 'nextjs',
        Cookie: cookies, // ✅ Backend로 Cookie 전달
      },
      body,
      credentials: 'include', // ✅ Cookie 포함
    });

    const data = await response.text();

    // ✅ Backend에서 Set-Cookie 헤더 받아서 클라이언트로 전달
    const setCookieHeader = response.headers.get('set-cookie');
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (setCookieHeader) {
      responseHeaders['Set-Cookie'] = setCookieHeader;
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('tRPC proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 3. tRPC Client 설정

### 3.1 Credentials 설정

```typescript
// apps/web/src/app/providers/TRPCProvider.tsx
const [trpcClient] = useState(() =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          return {
            'x-trpc-source': 'react',
          };
        },
        // ✅ Cookie 자동 포함
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // ✅ 중요!
          });
        },
      }),
    ],
  })
);
```

---

## 4. Token Refresh 구현

### 4.1 Refresh Endpoint

```typescript
// apps/backend/src/modules/users/controllers.ts
export const refreshController = async ({ ctx }: any) => {
  // Cookie에서 refreshToken 추출
  const refreshToken = ctx.req.cookies.refreshToken;

  if (!refreshToken) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Token 검증 및 새로운 accessToken 생성
  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken(payload.userId);

  // 새로운 accessToken을 Cookie로 설정
  ctx.res.setHeader(
    'Set-Cookie',
    `accessToken=${newAccessToken}; ${serializeCookie(ACCESS_TOKEN_OPTIONS)}`
  );

  return { success: true };
};
```

### 4.2 Auto Refresh Hook

```typescript
// apps/web/src/shared/hooks/useTokenRefresh.ts
'use client';

import { useEffect } from 'react';
import { useTRPC } from '@/app/providers/TRPCProvider';

export const useTokenRefresh = () => {
  const trpc = useTRPC();
  const refreshMutation = trpc.users.refresh.useMutation();

  useEffect(() => {
    // 14분마다 자동 갱신 (accessToken 만료 15분)
    const interval = setInterval(
      () => {
        refreshMutation.mutate();
      },
      14 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  return refreshMutation;
};
```

---

## 5. Logout 구현

```typescript
// apps/backend/src/modules/users/controllers.ts
export const logOutController = async ({ ctx }: any) => {
  // Cookie 삭제
  ctx.res.setHeader('Set-Cookie', [
    'accessToken=; Path=/; Max-Age=0',
    'refreshToken=; Path=/; Max-Age=0',
  ]);

  return { success: true };
};
```

---

## 6. Protected Route 예시

```typescript
// apps/web/src/app/dashboard/page.tsx
'use client';

import { useTRPC } from '@/app/providers/TRPCProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const trpc = useTRPC();

  // Cookie가 있으면 자동으로 인증됨
  const { data, error } = trpc.users.getProfile.useQuery();

  useEffect(() => {
    if (error) {
      router.push('/');
    }
  }, [error]);

  if (!data) return <div>Loading...</div>;

  return <div>Welcome, {data.name}</div>;
}
```

---

## 보안 체크리스트

- [x] HttpOnly - JavaScript 접근 차단
- [x] Secure - HTTPS only (production)
- [x] SameSite - CSRF 방어
- [x] credentials: 'include' - Cookie 전송
- [x] Token Refresh - 자동 갱신
- [x] Logout - Cookie 삭제

---

## 테스트

```bash
# 1. Backend 실행
cd apps/backend && pnpm dev

# 2. Next.js 실행
cd apps/web && pnpm dev

# 3. 브라우저 개발자 도구에서 확인
Application → Cookies → localhost:3000
- accessToken: HttpOnly ✓
- refreshToken: HttpOnly ✓
```
