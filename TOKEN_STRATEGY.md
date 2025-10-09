# Token Management Strategy Analysis

## Current Architecture

```
Client (Browser)
    ↓ (tRPC)
Next.js Server (Port 3000) [Proxy]
    ↓ (tRPC over HTTP)
Backend API (Port 4000)
```

---

## 방법 1: HttpOnly Cookie (★★★★★ 추천)

### 구조

- Backend: HttpOnly Cookie로 토큰 전송
- Next.js Proxy: Cookie를 그대로 전달
- Client: 자동으로 Cookie 포함

### 장점

✅ **보안성 최상** - JavaScript로 접근 불가 (XSS 방어)
✅ **CSRF 방어** - SameSite 속성 사용
✅ **SSR 지원** - Server Component에서도 사용 가능
✅ **자동 전송** - 별도 헤더 처리 불필요
✅ **구현 간단** - Cookie가 자동으로 포함됨

### 단점

❌ CORS 설정 필요 (`credentials: 'include'`)
❌ 모바일 앱 사용 시 제약

### 보안 설정

```typescript
// Backend Cookie 설정
{
  httpOnly: true,      // XSS 방어
  secure: true,        // HTTPS only
  sameSite: 'lax',     // CSRF 방어
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

---

## 방법 2: localStorage + Authorization Header (★★☆☆☆)

### 구조

- Backend: JSON으로 토큰 반환
- Client: localStorage에 저장
- Request: Authorization 헤더에 포함

### 장점

✅ 구현 간단
✅ 모바일/웹 공용 가능
✅ CORS 문제 적음

### 단점

❌ **XSS 취약** - JavaScript로 접근 가능
❌ localStorage 노출 위험
❌ SSR 불가 (window 객체 필요)

---

## 방법 3: Hybrid - HttpOnly Cookie + Memory (★★★★☆)

### 구조

- **refreshToken**: HttpOnly Cookie (장기, 7일)
- **accessToken**: Memory State (단기, 15분)
- Token 만료 시 자동 갱신

### 장점

✅ **보안성 우수** - refreshToken은 HttpOnly
✅ **성능 좋음** - accessToken은 메모리
✅ **적절한 균형** - 보안 + 사용성

### 단점

❌ 구현 복잡도 증가
❌ 새로고침 시 재로그인 필요 (개선 가능)

### Token Lifecycle

```
1. Login → refreshToken (Cookie) + accessToken (Memory)
2. API Call → accessToken 사용
3. accessToken 만료 → refreshToken으로 갱신
4. refreshToken 만료 → 재로그인
```

---

## 방법 4: BFF Pattern - Session in Next.js (★★★☆☆)

### 구조

- Next.js: 세션 관리 (Redis/Database)
- Client ↔ Next.js: Session Cookie
- Next.js ↔ Backend: Token 교환

### 장점

✅ **최고 보안** - Token이 Browser에 노출 안 됨
✅ SSR 완벽 지원
✅ Token 관리 중앙화

### 단점

❌ **복잡도 매우 높음**
❌ Next.js 서버 부하 증가
❌ 세션 스토어 필요 (Redis)
❌ 확장성 고려 필요

---

## 최종 추천: 방법 1 (HttpOnly Cookie)

### 이유

1. **현재 구조에 최적**
   - Next.js가 이미 proxy 역할
   - Cookie가 자동으로 전달됨

2. **보안성 충분**
   - HttpOnly + Secure + SameSite
   - XSS/CSRF 방어

3. **구현 간단**
   - 백엔드 Cookie 설정만 변경
   - 클라이언트 코드 최소화

4. **SSR 지원**
   - Server Component에서도 사용 가능

### 구현 체크리스트

- [ ] Backend: HttpOnly Cookie 설정
- [ ] Backend: CORS credentials 허용
- [ ] Next.js Proxy: Cookie 전달 처리
- [ ] tRPC Client: credentials 설정
- [ ] Token refresh 자동화
- [ ] Logout 시 Cookie 삭제

---

## 대안: 높은 보안 요구 시 방법 3 (Hybrid)

refreshToken만 Cookie, accessToken은 메모리 관리
→ 보안성 극대화 + 새로고침 시 자동 갱신 가능
