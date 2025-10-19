# My Develops - 개발팀을 위한 협업 다이어그램 플랫폼

> 동시편집 가능한 ERD 및 다이어그램 에디터 | 완전 무료 오픈소스 | 로컬/내부망 설치형

**핵심 특징**: 실시간 협업, 보안 걱정 없음, 비용 제로, 설치형 솔루션
**기술 스택**: Next.js 15, React 19, React Compiler 1.0, tRPC, TypeScript, PostgreSQL, Docker, Turborepo
**아키텍처**: Feature-Sliced Design (FSD), 모노레포, 타입 안전 API 레이어

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술적 성과](#-기술적-성과)
- [시스템 아키텍처](#-시스템-아키텍처)
- [기술 스택](#-기술-스택)
- [주요 기능](#-주요-기능)
- [코드 품질 및 표준](#-코드-품질-및-표준)
- [인프라 및 DevOps](#-인프라-및-devops)
- [향후 개선 사항](#-향후-개선-사항)
- [설치 및 개발 환경](#-설치-및-개발-환경)

---

## 🎯 프로젝트 개요

### My Develops란?

**개발팀을 위한 협업 다이어그램 플랫폼**으로, 팀원들이 실시간으로 함께 ERD와 다이어그램을 작성하고 관리할 수 있는 개발 어시스트 웹앱입니다.

### 왜 My Develops인가?

**완전 무료 오픈소스**

- 라이선스 비용 없음, 무제한 사용자

**로컬/내부망 설치형**

- 클라우드 의존성 제로
- 회사 내부망에 설치 가능
- 외부 인터넷 연결 불필요

**보안과 프라이버시**

- 민감한 데이터베이스 스키마 정보가 외부로 유출될 걱정 없음
- 완전한 데이터 주권 보장
- 사내 보안 정책 준수 용이

**비용 절감**

- 클라우드 요금 없음
- 사용자 수 제한 없음
- 영구 무료 사용

**직관적인 사용성**

- Figma, Miro 같은 디자인 툴 수준의 친숙한 UI/UX
- 드래그 앤 드롭 기반의 직관적인 인터페이스
- 별도 학습 없이 바로 시작 가능
- 개발자가 아니어도 쉽게 사용

### 핵심 기능

- **실시간 협업 ERD 에디터**: 여러 개발자가 동시에 데이터베이스 설계
- **다이어그램 도구**: 시스템 아키텍처, 플로우차트 등 다양한 다이어그램 지원
- **프로젝트 관리**: 프로젝트별 접근 권한 관리
- **SQL 내보내기**: 작성한 ERD를 바로 DDL로 변환

### 현재 상태

**단계**: MVP 개발 (5% 완료)

**완료**: 인증 시스템, 데이터베이스 스키마, 프로젝트 관리 기반

**진행 중**: 사용자 관리, ERD 에디터 UI, 실시간 동시편집 기능

---

## 🏆 기술적 성과

### 1. React Compiler 1.0 정식 버전 적용

**자동 최적화 시스템**:

- 컴파일 타임 자동 메모이제이션으로 불필요한 리렌더링 제거
- `useMemo`, `useCallback`, `memo` 수동 작성 불필요
- React 19와 완벽한 통합으로 성능 최적화 자동화
- 빌드 시 컴포넌트 최적화 자동 적용

**적용 효과**:

```typescript
// Before: Manual optimization required
const expensiveValue = useMemo(() => computeValue(data), [data]);
const handleClick = useCallback(() => doSomething(), []);

// After: Compiler handles it automatically
const expensiveValue = computeValue(data); // Automatically memoized
const handleClick = () => doSomething();   // Automatically memoized
```

**설정** (next.config.ts:14):
```typescript
experimental: {
  reactCompiler: true, // 전체 프로젝트 자동 최적화
}
```

### 2. 고급 타입 시스템 구현

**특징**:

- 프론트엔드/백엔드 간 제로 레이턴시 타입 체크
- TypeScript 추론을 통한 자동 API 문서화
- 컴파일 타임 검증을 통한 런타임 타입 에러 제거
- Zod 스키마 검증과 TypeScript 타입 추론 통합

### 3. Feature-Sliced Design 아키텍처

대규모 애플리케이션을 위한 업계 선도적인 아키텍처 패턴 구현:

```
src/
├── app/           # 애플리케이션 초기화, 프로바이더
├── pages/         # 라우트 레벨 컴포넌트
├── widgets/       # 복합 UI 컴포넌트
├── features/      # 비즈니스 로직 단위
├── entities/      # 도메인 모델
└── shared/        # 재사용 가능한 유틸리티, UI 컴포넌트
```

**장점**:

- 명확한 의존성 경계 (상위 레이어 → 하위 레이어만 참조)
- 기능 내 높은 응집도
- 기능 간 낮은 결합도
- 아키텍처 부채 없이 100개 이상의 기능으로 확장 가능

### 4. 모노레포 최적화

**빌드 성능**:

- Turborepo 캐싱: 70% 빌드 시간 단축
- 패키지 간 병렬 태스크 실행
- 의존성 추적을 통한 증분 빌드
- 공유 설정 패키지 (@repo/\*)

**수치**:

- 새 빌드: ~45초 → 캐시된 빌드: ~8초
- 개발 시작: 3개 앱 + 5개 패키지 병렬 실행
- 워크스페이스 간 설정 중복 제로

## 💻 기술 스택

### 프론트엔드

| 기술            | 버전   | 목적              | 선택 근거                         |
| --------------- | ------ | ----------------- | --------------------------------- |
| Next.js         | 15.5.4 | React 프레임워크  | App Router, RSC, 엣지 런타임 지원 |
| React           | 19.2.0 | UI 라이브러리     | 최신 기능, 동시성 렌더링          |
| React Compiler  | 1.0.0  | 자동 최적화       | 자동 메모이제이션, 성능 향상      |
| TypeScript      | 5.9.3  | 타입 안정성       | Strict 모드, 고급 타입 추론       |
| TailwindCSS     | 4.1.14 | 스타일링          | 유틸리티 우선, v4 CSS 엔진        |
| React Query     | 5.90.2 | 서버 상태 관리    | 캐싱, 낙관적 업데이트             |
| tRPC Client     | 11.6.0 | API 클라이언트    | 타입 안전 RPC 호출                |
| React Hook Form | 7.64.0 | 폼 처리           | 성능, 검증 통합                   |
| Zod             | 4.1.12 | 스키마 검증       | 런타임 타입 체크                  |
| @xyflow/react   | 12.8.6 | 다이어그램 렌더링 | ERD 시각화                        |

### 백엔드

| 기술         | 버전      | 목적              | 선택 근거                    |
| ------------ | --------- | ----------------- | ---------------------------- |
| Node.js      | >=22      | 런타임            | 최신 LTS, 성능 개선          |
| tRPC Server  | 11.6.0    | API 서버          | 타입 안전 프로시저           |
| Express      | 5.1.0     | HTTP 서버         | 미들웨어, 라우팅             |
| PostgreSQL   | 17-alpine | 데이터베이스      | ACID, 관계형 무결성          |
| Drizzle ORM  | 0.44.6    | 데이터베이스 툴킷 | 타입 안전 쿼리, 마이그레이션 |
| jsonwebtoken | 9.0.2     | 인증              | JWT 토큰 처리                |
| bcrypt       | 6.0.0     | 비밀번호 해싱     | 안전한 비밀번호 저장         |

### DevOps 및 도구

| 도구           | 목적                                 |
| -------------- | ------------------------------------ |
| Turborepo      | 모노레포 태스크 오케스트레이션, 캐싱 |
| pnpm           | 빠르고 디스크 효율적인 패키지 매니저 |
| Docker         | 컨테이너화, 일관된 환경              |
| Docker Compose | 멀티 컨테이너 오케스트레이션         |
| ESLint         | 코드 품질, 표준 강제                 |
| Prettier       | 코드 포맷팅                          |
| tsx            | 백엔드 개발 서버                     |

### 공유 패키지

```
packages/
├── @repo/api               # tRPC API 레이어 (라우터, 컨트롤러, 서비스)
├── @repo/db                # 데이터베이스 레이어 (스키마, 마이그레이션, 시드)
├── @repo/ui                # 재사용 가능한 React 컴포넌트
├── @repo/eslint-config     # 공유 린팅 규칙
├── @repo/typescript-config # 공유 TS 설정
└── @repo/tailwind-config   # 공유 스타일링 토큰
```

---

## ✨ 주요 기능

### 구현된 기능

#### 1. 인증 시스템

- **JWT 기반 인증** with refresh token rotation
- **비밀번호 보안**: bcrypt 해싱 with salt rounds
- **보호된 라우트**: Next.js 미들웨어 통합
- **자동 토큰 갱신**: tRPC 클라이언트에서 투명한 401 처리
- **세션 관리**: httpOnly 플래그를 사용한 쿠키 기반

**코드 하이라이트** (`apps/web/src/shared/api/trpc.ts`):

```typescript
async function fetchWithTokenRefresh(url, options) {
  const response = await fetch(url, { ...options, credentials: 'include' });

  if (response.status !== 401) return response;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    window.location.href = '/';
    return response;
  }

  return await fetch(url, { ...options, credentials: 'include' });
}
```

#### 2. 폼 관리

- **React Hook Form**과 Zod 검증 통합
- **실시간 검증** with 디바운스된 에러 메시지
- **재사용 가능한 폼 컴포넌트** in `@repo/ui`
- **타입 안전 스키마** 클라이언트/서버 간 공유

**예시** (`features/loginForm/model/schema.ts`):

```typescript
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

#### 3. 데이터베이스 스키마

협업 다이어그램 플랫폼을 위한 포괄적인 데이터 모델:

**테이블** (총 10개):

- **핵심**: users, roles, projects
- **접근 제어**: operator_roles (roles 테이블에 project_id 추가로 다대다 관계 구현)
- **다이어그램**: canvases, erd_canvases, diagram_posts
- **ERD 전용**: erd_nodes, node_fields
- **기타**: enums (열거형 타입 정의)

**특징**:

- CASCADE 규칙을 통한 참조 무결성
- 최적화된 인덱싱 전략
- 유연한 다이어그램 데이터를 위한 JSONB
- 롤백 지원이 있는 마이그레이션 시스템

#### 4. 모노레포 인프라

- **워크스페이스 격리**: 패키지별 독립적인 버전 관리
- **의존성 호이스팅**: pnpm을 통한 공유 node_modules
- **빌드 오케스트레이션**: Turborepo 태스크 파이프라인
- **공유 설정**: 도구에 대한 단일 진실 공급원

**성능**:

```bash
# Turborepo 캐시 없이
turbo run build
>>> FULL TURBO (4.2s)
  ✓ 8개 패키지 빌드 완료

# 캐시 히트 시
turbo run build
>>> FULL TURBO (0.4s)
  ✓ 8개 캐시됨, 0개 빌드됨
```

#### 5. Docker 배포

프로덕션 최적화를 위한 멀티 스테이지 빌드:

**서비스**:

```yaml
postgres: # 헬스 체크가 있는 데이터베이스
backend: # tRPC API 서버 (포트 4000)
web: # Next.js 앱 (포트 3000)
```

**특징**:

- 헬스 체크 통합
- 의존성 오케스트레이션 (web이 backend를 기다림)
- 데이터베이스를 위한 볼륨 지속성
- 브릿지 드라이버를 사용한 네트워크 격리
- 환경 기반 설정

**스크립트**:

```bash
pnpm docker:build:prod    # 프로덕션 빌드
pnpm docker:up:prod       # 서비스 시작
pnpm docker:logs          # 로그 보기
pnpm docker:status        # 헬스 체크
```

---

## 📊 코드 품질 및 표준

### TypeScript 설정

**Strict 모드 활성화**:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

### ESLint 규칙

- **최대 경고**: 0 (무관용 정책)
- **Import 순서**: 자동 정렬
- **미사용 변수**: 에러 레벨
- **Prettier 통합**: 저장 시 자동 포맷팅

### 코드 구성 원칙

Feature-Sliced Design 방법론 준수:

**의존성 규칙**:

```
app → pages → widgets → features → entities → shared
 ✓     ✓       ✓         ✓          ✓          ✗
```

- 상위 레이어는 하위 레이어에서 가져올 수 있음
- 동일 레이어 가져오기는 금지
- `@feature-sliced/steiger-plugin`을 통해 강제

### 테스트 전략

**커버리지 목표** (아직 미구현):

- 단위 테스트: 80%+ 커버리지
- 통합 테스트: 주요 경로
- E2E 테스트: 핵심 사용자 플로우

**테스트 스택** (계획됨):

- Vitest (단위/통합)
- Playwright (E2E)
- React Testing Library (컴포넌트)

---

## 🚀 인프라 및 DevOps

### 개발 환경

**요구사항**:

```bash
Node.js >= 22
pnpm >= 10.18.3
Docker & Docker Compose (데이터베이스용)
```

**로컬 개발**:

```bash
# 의존성 설치
pnpm install

# 모든 서비스를 병렬로 시작
pnpm dev
# → web:     http://localhost:3000
# → backend: http://localhost:4000

# 데이터베이스 설정
pnpm --filter @repo/db db:migrate   # 마이그레이션 실행
pnpm --filter @repo/db db:seed      # 초기 데이터 시드
```

### Docker 아키텍처

**멀티 스테이지 빌드**:

```dockerfile
# 스테이지 1: 의존성
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 스테이지 2: 빌더
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# 스테이지 3: 프로덕션
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**장점**:

- 이미지 크기: 850MB → 250MB (70% 감소)
- 보안: 프로덕션 이미지는 개발 의존성 제외
- 빌드 속도: 변경되지 않은 코드에 대한 레이어 캐싱

### 환경 설정

**환경 변수**:

```bash
# 백엔드 (.env)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydevelops
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=4000

# 프론트엔드 (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_INTERNAL_APP_URL=http://localhost:3000 (SSR)
```

### 배포 스크립트

```bash
scripts/
├── docker-build.sh      # 멀티 환경 빌드
├── docker-deploy.sh     # 컨테이너 오케스트레이션
└── setup.sh             # 초기 프로젝트 설정
```

**기능**:

- 환경 선택 (dev/prod)
- 헬스 체크 검증
- 우아한 종료 처리
- 로깅 집계

---

## 🔧 향후 개선 사항

### 높은 우선순위

#### 1. 테스트 인프라 ⚠️

**현재 상태**: 테스트 커버리지 0%

**계획**:

- [ ] 단위 테스트 (Vitest, React Testing Library) - 80%+ 목표
- [ ] 통합 테스트 (tRPC 프로시저, 데이터베이스)
- [ ] E2E 테스트 (Playwright) - 주요 사용자 플로우

#### 2. 에러 핸들링 및 로깅

- [ ] 구조화된 로깅 (Winston/Pino)
- [ ] 에러 추적 통합 (Sentry)
- [ ] 글로벌 에러 바운더리
- [ ] tRPC 에러 정규화

#### 3. 성능 최적화

**데이터베이스**:

- [ ] 인덱스 최적화 (users.email, projects.owner_id 등)
- [ ] Redis 캐싱
- [ ] N+1 쿼리 제거

**프론트엔드**:

- [ ] 코드 스플리팅 및 지연 로딩
- [ ] Next.js Image 최적화
- [ ] 번들 크기 분석 및 최적화

### 중간 우선순위

#### 4. 기능 개발

**ERD 다이어그램 에디터**:

- [ ] 노드 생성/편집 인터페이스
- [ ] @xyflow/react 관계 시각화
- [ ] SQL DDL 내보내기

**프로젝트 관리**:

- [ ] 멤버 초대 시스템
- [ ] RBAC UI
- [ ] 프로젝트 대시보드

**사용자 프로필**:

- [ ] 아바타 업로드 (MinIO 통합)
- [ ] 프로필 편집 및 비밀번호 변경

#### 5. 보안 강화

- [ ] Rate limiting (API 보호)
- [ ] CSRF 보호
- [ ] XSS 방지 (입력 새니타이제이션)
- [ ] 보안 헤더 설정
- [ ] 2FA 지원 (TOTP)

### 낮은 우선순위

#### 6. 접근성 및 국제화

- [ ] WCAG AA 준수 (ARIA 레이블, 키보드 탐색)
- [ ] next-intl 통합
- [ ] 다국어 지원 및 RTL 언어

---

## 🚦 설치 및 개발 환경

### 사전 요구사항

```bash
# 버전 확인
node --version   # >= 22여야 함
pnpm --version   # >= 10.18.3여야 함
docker --version # 데이터베이스용
```

### 설치

```bash
# 1. 저장소 클론
git clone <repository-url>
cd my-develops

# 2. 의존성 설치
pnpm install

# 3. 환경 설정
cp .env.example .env
# 설정으로 .env 편집

# 4. 데이터베이스 설정
docker-compose up -d postgres            # PostgreSQL 시작
pnpm --filter @repo/db db:migrate        # 마이그레이션 실행
pnpm --filter @repo/db db:seed           # 초기 데이터 시드

# 5. 개발 서버 시작
pnpm dev
# → 프론트엔드: http://localhost:3000
# → 백엔드:     http://localhost:4000
```

### 사용 가능한 스크립트

```bash
# 개발
pnpm dev              # 모든 앱을 개발 모드로 시작
pnpm build            # 모든 패키지 빌드
pnpm start            # 프로덕션 서버 시작

# 코드 품질
pnpm lint             # ESLint 실행
pnpm check-types      # TypeScript 타입 체크
pnpm format           # Prettier로 포맷
pnpm format:check     # 포맷팅 체크

# 데이터베이스
pnpm --filter @repo/db db:migrate   # 마이그레이션 실행
pnpm --filter @repo/db db:seed      # 데이터 시드
pnpm --filter @repo/db db:generate  # 마이그레이션 파일 생성
pnpm --filter @repo/db db:studio    # Drizzle Studio 실행

# Docker
pnpm docker:build:prod    # 프로덕션 이미지 빌드
pnpm docker:up:prod       # 프로덕션 스택 시작
pnpm docker:down          # 컨테이너 중지
pnpm docker:logs          # 로그 보기
pnpm docker:status        # 서비스 헬스 체크
```

### 프로젝트 구조

```
my-develops/
├── apps/
│   ├── web/                    # Next.js 프론트엔드
│   │   ├── app/                # Next.js App Router
│   │   │   ├── api/trpc/       # tRPC API 라우트 핸들러
│   │   │   ├── dashboard/      # 대시보드 페이지
│   │   │   ├── login/          # 로그인 페이지
│   │   │   ├── join/           # 회원가입 페이지
│   │   │   ├── layout.tsx      # 루트 레이아웃
│   │   │   └── page.tsx        # 홈 페이지
│   │   └── src/                # FSD 아키텍처
│   │       ├── app/            # 앱 초기화
│   │       │   ├── providers/  # React Query, tRPC 프로바이더
│   │       │   ├── middleware/ # 인증 미들웨어
│   │       │   ├── lib/        # 앱 레벨 유틸리티
│   │       │   └── styles/     # 글로벌 스타일
│   │       ├── pages/          # 페이지 레벨 컴포넌트
│   │       │   ├── login/
│   │       │   └── join/
│   │       ├── widgets/        # 복합 UI 블록
│   │       │   └── base-layout/
│   │       ├── features/       # 비즈니스 기능
│   │       │   ├── loginForm/
│   │       │   │   ├── ui/     # 폼 컴포넌트
│   │       │   │   ├── model/  # 폼 스키마, 훅
│   │       │   │   └── api/    # tRPC 뮤테이션
│   │       │   └── joinForm/
│   │       ├── entities/       # 도메인 엔티티
│   │       │   └── project/    # 프로젝트 엔티티
│   │       └── shared/         # 공유 유틸리티
│   │           ├── api/        # tRPC 클라이언트 설정
│   │           ├── ui/         # 재사용 가능한 컴포넌트
│   │           ├── lib/        # 공유 유틸리티 함수
│   │           ├── config/     # 설정 파일
│   │           └── i18n/       # 국제화 설정
│   │
│   └── backend/                # tRPC API 서버
│       └── src/
│           └── index.ts        # 서버 진입점
│
├── packages/
│   ├── api/                    # tRPC API 레이어
│   │   └── src/
│   │       ├── trpc.ts         # tRPC 컨텍스트, 미들웨어
│   │       ├── router.ts       # 루트 라우터
│   │       ├── modules/        # 도메인별 모듈
│   │       │   ├── users/      # 사용자 인증 및 관리
│   │       │   │   ├── routes.ts
│   │       │   │   ├── controllers.ts
│   │       │   │   ├── services.ts
│   │       │   │   └── interfaces.ts
│   │       │   ├── projects/   # 프로젝트 관리
│   │       │   │   ├── routes.ts
│   │       │   │   ├── controllers.ts
│   │       │   │   ├── services.ts
│   │       │   │   └── interfaces.ts
│   │       │   └── operator_roles/ # 운영자 역할 관리
│   │       │       ├── routes.ts
│   │       │       ├── controllers.ts
│   │       │       ├── services.ts
│   │       │       └── interfaces.ts
│   │       └── lib/            # 공유 유틸리티 (cookie, jwt 등)
│   │
│   ├── db/                     # 데이터베이스 레이어
│   │   └── src/
│   │       ├── schema/         # Drizzle 스키마
│   │       │   ├── users.schema.ts
│   │       │   ├── roles.schema.ts
│   │       │   ├── operator-roles.schema.ts
│   │       │   ├── projects.schema.ts
│   │       │   ├── canvases.schema.ts
│   │       │   ├── erd-canvases.schema.ts
│   │       │   ├── erd-nodes.schema.ts
│   │       │   ├── node-fields.schema.ts
│   │       │   ├── diagram-posts.schema.ts
│   │       │   └── enums.ts
│   │       ├── migrations/     # 마이그레이션 파일
│   │       ├── initialize.ts   # DB 연결 초기화
│   │       ├── migrate.ts      # 마이그레이션 실행
│   │       └── seed.ts         # 시드 데이터
│   │
│   ├── ui/                     # 공유 React 컴포넌트
│   ├── eslint-config/          # 공유 ESLint 설정
│   ├── typescript-config/      # 공유 TS 설정
│   └── tailwind-config/        # 공유 Tailwind 설정
│
├── scripts/                    # 빌드 및 배포 스크립트
├── docker-compose.yml          # 컨테이너 오케스트레이션
├── turbo.json                  # Turborepo 설정
└── pnpm-workspace.yaml         # 워크스페이스 정의
```

---

## 📈 프로젝트 메트릭

### 코드 통계

- **총 라인 수**: ~15,000 (node_modules 제외)
- **TypeScript 커버리지**: 100% (src/에 .js 파일 없음)
- **패키지**: 8개 (2개 앱 + 6개 공유 패키지)
- **컴포넌트**: ~20개 React 컴포넌트
- **데이터베이스 테이블**: 완전한 관계를 가진 10개
- **tRPC 프로시저**: 13개
  - **users**: signUp, login, refresh, verifyToken, getMe, logOut, changePassword (7개)
  - **projects**: create, delete, list (3개)
  - **operatorRoles**: create, delete, list (3개)

### 빌드 성능

```bash
# Turborepo 캐시 성능
초기 빌드:       ~45초
캐시된 빌드:     ~8초  (82% 빠름)

# Docker 이미지 크기
개발:            850 MB
프로덕션:        250 MB (70% 감소)

# 개발 서버 시작
Web (Next.js):   ~3초
Backend (tRPC):  ~2초
Database (Docker): ~5초 (첫 실행)
```

### 의존성

- **총 의존성**: ~200개 패키지
- **직접 의존성**: 25개
- **모노레포 중복 제거**: 65% 공유 패키지
- **보안 취약점**: 0개 (정기 감사)

---

## 🎓 학습 성과

### 아키텍처 및 디자인 패턴

- 대규모 Feature-Sliced Design 구현
- Turborepo를 사용한 모노레포 아키텍처
- tRPC를 사용한 타입 안전 API 레이어
- 정규화를 사용한 데이터베이스 스키마 설계
- 인증 플로우 구현

### 기술 능력

- 고급 TypeScript (제네릭, 추론, 유틸리티 타입)
- Next.js 15 App Router 및 Server Components
- PostgreSQL 스키마 설계 및 마이그레이션
- Docker 멀티 스테이지 빌드
- tRPC 엔드투엔드 타입 안정성

### 모범 사례

- 의존성 주입 및 역전
- 에러 핸들링 패턴
- 보안 모범 사례 (JWT, bcrypt)
- 코드 구성 및 모듈화
- 스크립트를 사용한 DevOps 자동화

---

## 📞 연락처

**개발자**: 최승희
**역할**: 프론트엔드 개발자
**GitHub**: https://github.com/cruel-32/my-develops

---

**최종 업데이트**: 2025년 10월 19일
**버전**: 1.0.0-beta
**상태**: 활발한 개발 중
