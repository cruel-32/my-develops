# Docker Setup for Turborepo Monorepo

이 문서는 Turborepo 모노레포에 Docker를 적용하여 멀티 프로젝트를 빌드하고 배포하는 방법을 설명합니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web  │    │  Express API    │    │   PostgreSQL    │
│   (Port 3000)  │◄───┤   (Port 4000)  │◄───┤   (Port 5432)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 빠른 시작

### 1. 초기 설정
```bash
# 의존성 설치 및 환경 설정
pnpm run setup
```

### 2. 개발 환경 실행
```bash
# 개발용 빌드 및 실행
pnpm run docker:build:dev
pnpm run docker:up:dev
```

### 3. 프로덕션 환경 실행
```bash
# 프로덕션용 빌드 및 실행
pnpm run docker:build:prod
pnpm run docker:up:prod
```

## 📁 파일 구조

```
.
├── apps/
│   ├── backend/
│   │   └── Dockerfile          # Backend용 Dockerfile
│   └── web/
│       └── Dockerfile           # Web용 Dockerfile
├── scripts/
│   ├── docker-build.sh         # Docker 빌드 스크립트
│   ├── docker-deploy.sh        # Docker 배포 스크립트
│   └── setup.sh                # 초기 설정 스크립트
├── docker-compose.yml          # 프로덕션용 Docker Compose
├── docker-compose.dev.yml      # 개발용 Docker Compose
└── .dockerignore               # Docker 무시 파일
```

## 🛠️ 사용 가능한 명령어

### Docker 빌드
```bash
# 개발용 빌드
pnpm run docker:build:dev

# 프로덕션용 빌드
pnpm run docker:build:prod

# 캐시 없이 빌드
./scripts/docker-build.sh production --no-cache
```

### Docker 배포
```bash
# 서비스 시작
pnpm run docker:up:dev
pnpm run docker:up:prod

# 서비스 중지
pnpm run docker:down:dev
pnpm run docker:down:prod

# 서비스 재시작
pnpm run docker:restart:dev
pnpm run docker:restart:prod

# 로그 확인
pnpm run docker:logs:dev
pnpm run docker:logs:prod

# 서비스 상태 확인
pnpm run docker:status:dev
pnpm run docker:status:prod
```

## 🌐 서비스 접근

### 개발 환경
- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

### 프로덕션 환경
- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

## 🔧 환경 변수

### .env 파일 설정
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydevelops

# Backend
NODE_ENV=development
PORT=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📦 Turborepo Docker 최적화

### turbo prune 활용
각 Dockerfile은 `turbo prune` 명령어를 사용하여 최적화됩니다:

1. **의존성 분리**: `--docker` 플래그로 의존성과 소스 파일을 분리
2. **캐시 최적화**: 의존성 변경 시에만 `pnpm install` 재실행
3. **멀티 스테이지 빌드**: 빌드와 런타임 환경 분리

### 빌드 과정
```dockerfile
# 1. Prune 단계: 필요한 워크스페이스만 추출
RUN turbo prune web --docker

# 2. Install 단계: 의존성만 설치
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# 3. Build 단계: 소스 파일 복사 및 빌드
COPY --from=builder /app/out/full/ .
RUN pnpm run build
```

## 🔧 사용된 기술 스택

### 최신 버전 사용
- **Node.js**: 22-alpine (LTS)
- **PostgreSQL**: 17-alpine (최신)
- **Docker Compose**: v2 (version 명시 제거)
- **Package Manager**: pnpm (고성능)

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 사용 중인 포트 확인
   lsof -i :3000
   lsof -i :4000
   lsof -i :5432
   ```

2. **Docker 이미지 정리**
   ```bash
   # 사용하지 않는 이미지 삭제
   docker image prune -a
   
   # 볼륨 정리
   docker volume prune
   ```

3. **로그 확인**
   ```bash
   # 특정 서비스 로그
   docker-compose logs backend
   docker-compose logs web
   docker-compose logs postgres
   ```

### 개발 환경 디버깅
```bash
# 컨테이너 내부 접속
docker exec -it my-develops-backend-dev sh
docker exec -it my-develops-web-dev sh

# 데이터베이스 접속
docker exec -it my-develops-postgres-dev psql -U postgres -d mydevelops
```

## 📚 추가 리소스

- [Turborepo Docker 가이드](https://turborepo.com/docs/guides/tools/docker)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Next.js Docker 배포](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker 이미지](https://hub.docker.com/_/postgres)
