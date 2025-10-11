# Hybrid Approach (고급 보안)

## 🔐 방법 3: HttpOnly Cookie + Memory State

refreshToken만 Cookie, accessToken은 메모리(State) 관리

---

## 핵심 개념

```
┌─────────────────────────────────────────┐
│ Login                                    │
│ ↓                                        │
│ refreshToken → HttpOnly Cookie (7일)    │
│ accessToken  → Memory State (15분)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ API Request                              │
│ ↓                                        │
│ accessToken from Memory                  │
│ ↓ (if expired)                           │
│ refreshToken from Cookie → New Access    │
└─────────────────────────────────────────┘
```

---

## 장점

✅ **최고 보안**

- refreshToken은 HttpOnly (XSS 방어)
- accessToken은 메모리 (짧은 수명)
- 탈취되어도 피해 최소화

✅ **성능 좋음**

- accessToken은 메모리에서 빠르게 접근
- Cookie 파싱 불필요

---

## 구현

### 1. Auth Context

```typescript
// apps/web/src/shared/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTRPC } from '@/app/providers/TRPCProvider';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const trpc = useTRPC();

  // 앱 시작 시 refreshToken으로 accessToken 발급
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await trpc.user.refresh.mutate();
        setAccessToken(result.accessToken);
      } catch (error) {
        console.log('Not authenticated');
      }
    };

    initAuth();
  }, []);

  // 자동 갱신 (14분마다)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(async () => {
      try {
        const result = await trpc.user.refresh.mutate();
        setAccessToken(result.accessToken);
      } catch (error) {
        setAccessToken(null);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const refresh = async () => {
    const result = await trpc.user.refresh.mutate();
    setAccessToken(result.accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        isAuthenticated: !!accessToken,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2. tRPC Client with Auth

```typescript
// apps/web/src/app/providers/TRPCProvider.tsx
const [trpcClient] = useState(() =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          // ✅ Memory에서 accessToken 가져오기
          const accessToken = getAccessTokenFromMemory();

          return {
            'x-trpc-source': 'react',
            ...(accessToken && {
              Authorization: `Bearer ${accessToken}`,
            }),
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // ✅ refreshToken Cookie 포함
          });
        },
      }),
    ],
  })
);
```

### 3. Backend Response

```typescript
// apps/backend/src/modules/user/controllers.ts
export const loginController = async ({ input, ctx }: any) => {
  const { email, password } = input;

  const user = await authenticateUser(email, password);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // ✅ refreshToken만 Cookie
  ctx.res.setHeader(
    'Set-Cookie',
    `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  );

  // ✅ accessToken은 JSON으로 반환
  return {
    success: true,
    accessToken, // Client가 메모리에 저장
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export const refreshController = async ({ ctx }: any) => {
  const refreshToken = ctx.req.cookies.refreshToken;

  if (!refreshToken) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken = generateAccessToken(payload.userId);

  // ✅ accessToken만 JSON으로 반환 (Cookie 아님)
  return {
    success: true,
    accessToken: newAccessToken,
  };
};
```

### 4. Login with Memory Storage

```typescript
// apps/web/src/features/loginForm/api/useLoginMutation.ts
export const useLoginMutation = () => {
  const trpc = useTRPC();
  const { setAccessToken } = useAuth();

  return trpc.user.login.useMutation({
    onSuccess: (data) => {
      // ✅ accessToken을 메모리(State)에 저장
      setAccessToken(data.accessToken);

      console.log('Login successful');
      // TODO: Redirect to dashboard
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
```

### 5. Protected Route

```typescript
// apps/web/src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isAuthenticated, accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return <div>Dashboard - Token: {accessToken?.substring(0, 20)}...</div>;
}
```

---

## 새로고침 처리

### 문제

- accessToken이 메모리에만 있어서 새로고침 시 사라짐

### 해결

- AuthProvider 초기화 시 refreshToken으로 자동 재발급
- 사용자는 로그인 상태 유지

```typescript
useEffect(() => {
  const initAuth = async () => {
    try {
      // ✅ refreshToken (Cookie)로 accessToken 재발급
      const result = await trpc.user.refresh.mutate();
      setAccessToken(result.accessToken);
    } catch (error) {
      // Cookie 없거나 만료됨 → 로그아웃 상태
    }
  };

  initAuth();
}, []);
```

---

## 비교: 방법 1 vs 방법 3

| 항목        | 방법 1 (Cookie) | 방법 3 (Hybrid)   |
| ----------- | --------------- | ----------------- |
| 보안성      | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐        |
| 구현 난이도 | ⭐⭐ (쉬움)     | ⭐⭐⭐⭐ (어려움) |
| 성능        | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐        |
| 새로고침    | 자동 유지       | 자동 재발급       |
| SSR 지원    | ✅              | ✅ (약간 복잡)    |
| 코드량      | 적음            | 많음              |

---

## 추천

### 방법 1 선택

- 일반적인 웹 애플리케이션
- 빠른 개발 필요
- 충분한 보안

### 방법 3 선택

- 금융/의료 등 높은 보안 요구
- 성능 최적화 중요
- 개발 리소스 충분
