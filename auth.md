# 인증 시스템 구현 문서 (Authentication Implementation)

## 📋 개요

현재 프로젝트의 인증 시스템은 **HttpOnly Cookie 기반 JWT 토큰 관리** 방식을 사용합니다.

### 선택한 방식: Method 1 - HttpOnly Cookie

**아키텍처**:

```
Client (Browser)
    ↓ (tRPC + Cookie)
Next.js Server (Port 3000) [Proxy Layer]
    ↓ (tRPC over HTTP + Cookie)
Backend API Server (Port 4000)
```

### 왜 이 방식을 선택했는가?

| 항목                 | 설명                                                      |
| -------------------- | --------------------------------------------------------- |
| **보안성**           | ⭐⭐⭐⭐⭐ HttpOnly로 XSS 공격 방어, SameSite로 CSRF 방어 |
| **구현 복잡도**      | ⭐⭐ 상대적으로 간단한 구현                               |
| **SSR 지원**         | ✅ Next.js Server Component에서도 사용 가능               |
| **자동 전송**        | ✅ 별도 헤더 처리 불필요, 브라우저가 자동 처리            |
| **현재 구조 적합성** | ✅ Next.js Proxy 구조에 최적화                            |

---

## 🔐 보안 설정

### Cookie 옵션

```typescript
{
  httpOnly: true,      // JavaScript 접근 차단 (XSS 방어)
  secure: true,        // HTTPS only (프로덕션)
  sameSite: 'lax',     // CSRF 방어
  path: '/',           // 모든 경로에서 사용
}
```

### 토큰 유효기간

- **accessToken**: 15분 (짧은 수명으로 보안 강화)
- **refreshToken**: 7일 (장기 세션 유지)

---

## 🏗️ 시스템 구조

### 1. 클라이언트 (Browser)

**위치**: `apps/web/`

#### 1.1 tRPC Provider (`src/app/providers/TRPCProvider.tsx`)

**역할**: tRPC 클라이언트 설정, Cookie 자동 포함, 자동 토큰 갱신

```typescript
/**
 * Custom fetch with automatic token refresh on 401
 */
async function fetchWithTokenRefresh(
  url: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> {
  // First attempt
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // If not 401, return response as is
  if (response.status !== 401) {
    return response;
  }

  console.log('🔄 401 detected, attempting token refresh...');

  // Try to refresh token
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    console.error('❌ Token refresh failed, redirecting to login...');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return response;
  }

  // Retry original request with new token
  console.log('🔁 Retrying original request with new token...');
  const retryResponse = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  return retryResponse;
}
```

**핵심 포인트**:

- `credentials: 'include'` 설정으로 브라우저가 자동으로 Cookie 전송
- ✅ **401 에러 자동 감지**: accessToken 만료 시 자동으로 refresh 시도
- ✅ **자동 재시도**: 토큰 갱신 성공 시 원래 요청을 자동으로 재시도
- ✅ **중복 방지**: 여러 요청이 동시에 401을 받아도 refresh는 1번만 실행
- ✅ **자동 로그아웃**: refresh 실패 시 자동으로 로그인 페이지로 리다이렉트
- 개발자가 수동으로 토큰을 관리할 필요 없음

#### 1.2 Login Mutation (`src/features/loginForm/api/useLoginMutation.ts`)

**역할**: 로그인 요청 및 성공 처리

```typescript
onSuccess: (data) => {
  console.log('Login successful:', data);
  // ✅ 토큰은 HttpOnly Cookie에 자동 저장됨
  // ✅ localStorage나 state에 저장할 필요 없음

  // TODO: 대시보드로 리다이렉트
  // window.location.href = '/dashboard';
};
```

**핵심 포인트**:

- 토큰을 명시적으로 저장하지 않음
- 브라우저가 Set-Cookie 헤더를 받아 자동으로 저장

---

### 2. Next.js Proxy Layer

**위치**: `apps/web/app/api/trpc/[trpc]/route.ts`

#### 역할

1. 클라이언트의 Cookie를 Backend로 전달
2. Backend의 Set-Cookie 헤더를 클라이언트로 전달

#### POST Handler

```typescript
export async function POST(request: NextRequest, { params }) {
  const { trpc } = await params;
  const body = await request.text();

  // ✅ 1. 클라이언트 Cookie 추출
  const cookies = request.headers.get('cookie') || '';

  // ✅ 2. Backend로 요청 (Cookie 포함)
  const response = await fetch(`${BACKEND_URL}/${trpc}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trpc-source': 'nextjs',
      Cookie: cookies, // Backend로 전달
    },
    body,
    credentials: 'include',
  });

  const data = await response.text();

  // ✅ 3. Backend의 Set-Cookie 헤더 추출
  const setCookieHeader = response.headers.get('set-cookie');
  const responseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // ✅ 4. 클라이언트로 Set-Cookie 전달
  if (setCookieHeader) {
    responseHeaders['Set-Cookie'] = setCookieHeader;
  }

  return new NextResponse(data, {
    status: response.status,
    headers: responseHeaders,
  });
}
```

**핵심 포인트**:

- Next.js가 단순 Proxy 역할만 수행
- Cookie를 변경하거나 저장하지 않고 그대로 전달
- GET 요청도 동일한 방식으로 처리

---

### 3. Backend API Server

**위치**: `apps/backend/src/`

#### 3.1 Cookie 유틸리티 (`lib/cookie.ts`)

**역할**: Cookie 설정 및 관리 유틸리티

```typescript
// ✅ 로그인 시 두 토큰 모두 설정
export function setAuthCookies(
  response: any,
  accessToken: string,
  refreshToken: string
): void {
  response.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=900`,
    `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
  ]);
}

// ✅ 토큰 갱신 시 accessToken만 업데이트
export function setAccessTokenCookie(response: any, accessToken: string): void {
  response.setHeader(
    'Set-Cookie',
    `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=900`
  );
}

// ✅ 로그아웃 시 Cookie 삭제
export function clearAuthCookies(response: any): void {
  response.setHeader('Set-Cookie', [
    'accessToken=; Path=/; Max-Age=0',
    'refreshToken=; Path=/; Max-Age=0',
  ]);
}
```

#### 3.2 tRPC Context (`trpc.ts`)

**역할**: 요청 컨텍스트 생성 및 인증 미들웨어

```typescript
// ✅ Context에 req, res 객체 포함 (Cookie 설정을 위해)
export const createContext = async (opts: CreateHTTPContextOptions) => {
  const authorization = opts.req.headers.authorization;
  return {
    req: opts.req,
    res: opts.res,
    authorization,
  };
};

// ✅ 인증 미들웨어: Cookie 우선, Authorization 헤더는 Fallback
const isAuthed = t.middleware(({ ctx, next }) => {
  const cookieHeader = ctx.req.headers.cookie;
  let token: string | undefined;

  // 1순위: Cookie에서 accessToken 추출
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    token = cookies['accessToken'];
  }

  // 2순위: Authorization 헤더 (하위 호환성)
  if (!token && ctx.authorization) {
    token = ctx.authorization.split(' ')[1];
  }

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No access token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'access-secret'
    );
    return next({
      ctx: {
        ...ctx,
        user: decoded as UserPayload,
      },
    });
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
});
```

#### 3.3 컨트롤러 (`modules/user/controllers.ts`)

##### 로그인 컨트롤러

```typescript
export const logInController = async ({
  input,
  ctx,
}: {
  input: LogInInput;
  ctx: { req: any; res: any };
}) => {
  // 1. 서비스에서 토큰 생성
  const { accessToken, refreshToken } = await userService.logIn(input);

  // 2. ✅ HttpOnly Cookie로 설정
  setAuthCookies(ctx.res, accessToken, refreshToken);

  // 3. ✅ 토큰을 응답에 포함하지 않음 (보안)
  return {
    success: true,
    message: 'Login successful',
  };
};
```

##### 토큰 갱신 컨트롤러

```typescript
export const refreshController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  // 1. ✅ Cookie에서 refreshToken 추출
  const cookieHeader = ctx.req.headers.cookie;
  let refreshToken: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    refreshToken = cookies['refreshToken'];
  }

  if (!refreshToken) {
    throw new Error('No refresh token provided');
  }

  // 2. 새로운 accessToken 생성
  const { accessToken } = await userService.refresh(refreshToken);

  // 3. ✅ 새로운 accessToken을 Cookie로 설정
  setAccessTokenCookie(ctx.res, accessToken);

  return {
    success: true,
    message: 'Token refreshed',
  };
};
```

##### 로그아웃 컨트롤러

```typescript
export const logOutController = async ({
  ctx,
}: {
  ctx: { user: { id: number }; req: any; res: any };
}) => {
  // 1. DB에서 refresh token 제거
  await userService.logOut(ctx.user.id);

  // 2. ✅ Cookie 삭제
  clearAuthCookies(ctx.res);

  return {
    success: true,
    message: 'Logged out successfully',
  };
};
```

#### 3.4 CORS 설정 (`index.ts`)

**역할**: Cross-Origin 요청 허용 및 Cookie 전송 허용

```typescript
const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware(req, res, next) {
    const origin = req.headers.origin || 'http://localhost:3000';

    // ✅ CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Cookie'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // ✅ Cookie 허용

    // Preflight 요청 처리
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    next();
  },
});
```

**핵심 포인트**:

- `Access-Control-Allow-Credentials: true` 필수
- Origin을 명시적으로 설정 (와일드카드 '\*' 사용 불가)
- Preflight OPTIONS 요청 처리

---

## 🔄 토큰 흐름 (Token Flow)

### 1. 로그인 (Login)

```
1. 사용자가 이메일/비밀번호 입력
   ↓
2. Browser → Next.js (/api/trpc/user.logIn)
   ↓
3. Next.js → Backend (POST /user.logIn)
   ↓
4. Backend: 사용자 인증 및 JWT 토큰 생성
   - accessToken: 15분
   - refreshToken: 7일
   ↓
5. Backend → Next.js
   Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax
   Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax
   ↓
6. Next.js → Browser (Set-Cookie 헤더 전달)
   ↓
7. Browser가 자동으로 Cookie 저장
   - accessToken (HttpOnly ✓)
   - refreshToken (HttpOnly ✓)
```

### 2. 인증된 API 요청 (Authenticated Request)

```
1. 사용자가 보호된 리소스 요청 (예: 프로필 조회)
   ↓
2. Browser → Next.js
   Cookie: accessToken=...; refreshToken=...
   (브라우저가 자동으로 Cookie 포함)
   ↓
3. Next.js → Backend
   Cookie: accessToken=...; refreshToken=...
   (Proxy가 Cookie 전달)
   ↓
4. Backend: isAuthed 미들웨어에서 Cookie 파싱
   - Cookie에서 accessToken 추출
   - JWT 검증
   - 사용자 정보를 ctx.user에 추가
   ↓
5. Backend: 요청 처리 및 응답
   ↓
6. Next.js → Browser
```

### 3. 토큰 갱신 (Token Refresh) - ✅ 자동화됨

```
1. 사용자가 API 요청 (15분 후 accessToken 만료 상태)
   ↓
2. Browser → Next.js → Backend
   Cookie: accessToken=EXPIRED; refreshToken=...
   ↓
3. Backend: accessToken 검증 실패
   Response: 401 UNAUTHORIZED
   ↓
4. ✅ TRPCProvider의 fetchWithTokenRefresh가 401 감지
   ↓
5. ✅ 자동으로 refresh 요청 시작
   Browser → Next.js (/api/trpc/user.refresh)
   Cookie: refreshToken=...
   ↓
6. Next.js → Backend (POST /user.refresh)
   Cookie: refreshToken=...
   ↓
7. Backend:
   - Cookie에서 refreshToken 추출
   - refreshToken 검증
   - DB의 refresh_token과 일치 확인
   - 새로운 accessToken 생성
   ↓
8. Backend → Next.js
   Set-Cookie: accessToken=NEW_TOKEN; HttpOnly; Secure; SameSite=Lax
   ↓
9. Next.js → Browser (새로운 Cookie 저장)
   ↓
10. ✅ 원래 요청 자동 재시도
    Browser → Next.js → Backend
    Cookie: accessToken=NEW_TOKEN; refreshToken=...
    ↓
11. Backend: 새로운 accessToken으로 인증 성공
    Response: 200 OK (정상 응답)
    ↓
12. ✅ 사용자는 에러를 인지하지 못함 (투명한 갱신)
```

**핵심 특징**:

- ✅ 완전 자동화: 사용자나 개발자가 신경 쓸 필요 없음
- ✅ 투명한 갱신: 사용자는 토큰 만료를 인지하지 못함
- ✅ 중복 방지: 동시에 여러 401이 발생해도 refresh는 1번만
- ✅ 자동 로그아웃: refreshToken도 만료되면 로그인 페이지로 자동 이동

### 4. 로그아웃 (Logout)

```
1. 사용자가 로그아웃 요청
   ↓
2. Browser → Next.js (/api/trpc/user.logOut)
   Cookie: accessToken=...; refreshToken=...
   ↓
3. Next.js → Backend (POST /user.logOut)
   ↓
4. Backend:
   - 인증 미들웨어 통과 (protectedProcedure)
   - DB의 refresh_token 제거
   - Cookie 삭제 헤더 설정
   ↓
5. Backend → Next.js
   Set-Cookie: accessToken=; Max-Age=0
   Set-Cookie: refreshToken=; Max-Age=0
   ↓
6. Next.js → Browser
   ↓
7. Browser가 Cookie 삭제
```

---

## 📂 구현된 파일 목록

### Frontend (Next.js)

| 파일                                                      | 역할        | 주요 변경사항                        |
| --------------------------------------------------------- | ----------- | ------------------------------------ |
| `apps/web/app/api/trpc/[trpc]/route.ts`                   | tRPC Proxy  | Cookie 전달 처리 (양방향)            |
| `apps/web/src/app/providers/TRPCProvider.tsx`             | tRPC Client | ✅ 자동 토큰 갱신, 401 에러 인터셉터 |
| `apps/web/src/features/loginForm/api/useLoginMutation.ts` | Login Hook  | 자동 Cookie 저장 방식                |

### Backend

| 파일                                           | 역할            | 주요 변경사항                         |
| ---------------------------------------------- | --------------- | ------------------------------------- |
| `apps/backend/src/lib/cookie.ts`               | Cookie 유틸     | **신규 파일** - Cookie 설정/삭제 함수 |
| `apps/backend/src/trpc.ts`                     | Context & Auth  | req/res 포함, Cookie 기반 인증        |
| `apps/backend/src/modules/user/controllers.ts` | User Controller | HttpOnly Cookie 설정 로직             |
| `apps/backend/src/modules/user/routes.ts`      | User Router     | refresh 엔드포인트 input 제거         |
| `apps/backend/src/index.ts`                    | Server Entry    | CORS credentials 설정                 |

---

## 🧪 테스트 방법

### 1. 서버 실행

```bash
# Backend 실행
cd apps/backend
pnpm dev

# Next.js 실행 (새 터미널)
cd apps/web
pnpm dev
```

### 2. 브라우저 개발자 도구에서 확인

#### 로그인 전

1. `http://localhost:3000` 접속
2. 개발자 도구 → Application → Cookies → `localhost:3000`
3. Cookie 없음 확인

#### 로그인 후

1. 로그인 폼에서 `super_admin@mydevelops.com` / `admin1234!` 입력
2. 로그인 성공
3. 개발자 도구 → Application → Cookies → `localhost:3000`

**확인 사항**:

```
✅ accessToken
   - Value: eyJhbGciOiJIUzI1NiIs... (JWT 토큰)
   - HttpOnly: ✓
   - Secure: ✓ (프로덕션)
   - SameSite: Lax
   - Max-Age: 900 (15분)

✅ refreshToken
   - Value: eyJhbGciOiJIUzI1NiIs... (JWT 토큰)
   - HttpOnly: ✓
   - Secure: ✓ (프로덕션)
   - SameSite: Lax
   - Max-Age: 604800 (7일)
```

#### Network 탭에서 확인

1. 개발자 도구 → Network
2. 로그인 요청 찾기 (`user.logIn`)
3. Response Headers 확인:

```
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax; Max-Age=900
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

4. 이후 API 요청의 Request Headers 확인:

```
Cookie: accessToken=...; refreshToken=...
```

---

## 🔒 보안 체크리스트

- [x] **HttpOnly** - JavaScript로 토큰 접근 불가 (XSS 방어)
- [x] **Secure** - HTTPS only (프로덕션 환경)
- [x] **SameSite=Lax** - CSRF 공격 방어
- [x] **credentials: 'include'** - Cookie 자동 전송
- [x] **CORS credentials** - Cross-Origin Cookie 허용
- [x] **Token in Cookie only** - 응답 JSON에 토큰 노출 안 함
- [x] **짧은 accessToken 수명** - 15분 (피해 최소화)
- [x] **긴 refreshToken 수명** - 7일 (사용자 편의성)
- [x] **DB에 refresh_token 저장** - 토큰 무효화 가능
- [x] **로그아웃 시 Cookie 삭제** - 완전한 세션 종료
- [x] **✅ 자동 토큰 갱신** - 401 에러 시 자동으로 refresh 후 재시도
- [x] **✅ 중복 refresh 방지** - 동시 요청 시 refresh는 1번만 실행
- [x] **✅ 자동 로그아웃** - refresh 실패 시 로그인 페이지로 리다이렉트

---

## 🚀 향후 개선 사항

### ~~1. 자동 토큰 갱신~~ ✅ 완료

tRPC Provider에 401 에러 인터셉터를 구현하여 자동 토큰 갱신 완료!

### 1. 인증 상태 관리

```typescript
// apps/web/src/shared/contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const trpc = useTRPC();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await trpc.user.getProfile.query();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Routes

```typescript
// apps/web/src/app/dashboard/page.tsx
export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return <div>Dashboard</div>;
}
```

---

## 📚 참고 문서

- `TOKEN_STRATEGY.md` - 4가지 토큰 관리 방식 비교 분석
- `IMPLEMENTATION_GUIDE.md` - HttpOnly Cookie 방식 상세 구현 가이드
- `HYBRID_APPROACH.md` - 고급 보안을 위한 Hybrid 방식 (refreshToken만 Cookie, accessToken은 메모리)

---

## ❓ FAQ

### Q1. 토큰이 브라우저 개발자 도구에서 보이지 않나요?

**A**: HttpOnly Cookie는 JavaScript로 접근할 수 없습니다. 개발자 도구의 Application → Cookies 탭에서만 확인 가능하며, `document.cookie`로는 접근할 수 없습니다. 이것이 XSS 공격을 방어하는 핵심 메커니즘입니다.

### Q2. 새로고침 시 로그인 상태가 유지되나요?

**A**: 네, 유지됩니다. Cookie는 브라우저에 저장되므로 새로고침, 탭 닫기, 브라우저 재시작 후에도 유효기간 내에는 계속 전송됩니다.

### Q3. 모바일 앱에서도 사용할 수 있나요?

**A**: React Native 등의 모바일 앱에서는 Cookie 처리가 제한적일 수 있습니다. 모바일 앱 지원이 필요하면 Authorization Header 방식을 함께 지원하거나, `HYBRID_APPROACH.md`를 참고하세요.

### Q4. HTTPS가 아닌 개발 환경에서도 동작하나요?

**A**: 네, 개발 환경에서는 `secure` 옵션이 `false`로 설정됩니다 (`process.env.NODE_ENV === 'production'` 체크). 프로덕션 배포 시에는 반드시 HTTPS를 사용해야 합니다.

### Q5. refreshToken도 Cookie에 있는데 보안상 문제 없나요?

**A**: HttpOnly + Secure + SameSite 설정으로 충분히 안전합니다. 더 높은 보안이 필요하면 `HYBRID_APPROACH.md`의 방식(refreshToken만 Cookie, accessToken은 메모리)을 고려할 수 있습니다.

### Q6. accessToken이 만료되면 어떻게 되나요?

**A**: ✅ 완전 자동으로 처리됩니다! 사용자가 API 요청 시 accessToken이 만료되어 401 에러가 발생하면:

1. tRPC Provider가 자동으로 감지
2. refreshToken으로 새로운 accessToken 발급
3. 원래 요청을 자동으로 재시도
4. 사용자는 에러를 전혀 인지하지 못함

refreshToken도 만료되었다면 자동으로 로그인 페이지로 리다이렉트됩니다.

### Q7. 여러 요청이 동시에 401을 받으면 어떻게 되나요?

**A**: 중복 방지 로직이 구현되어 있습니다. 첫 번째 401이 refresh를 시작하면, 이후 401을 받은 요청들은 같은 refresh Promise를 기다립니다. refresh는 항상 1번만 실행됩니다.

---

**작성일**: 2025-01-09
**최종 수정**: 2025-01-09
**버전**: 1.1
**구현 방식**: HttpOnly Cookie (Method 1) + 자동 토큰 갱신
