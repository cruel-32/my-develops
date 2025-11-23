# API Usage & Caching Guide

이 문서는 `my-develops` 프로젝트의 API 호출 및 캐싱 전략에 대한 가이드입니다.
본 프로젝트는 **Next.js App Router (Server)**와 **React Query (Client)**를 결합한 **Hybrid Data Fetching** 전략을 사용합니다.

## 1. 아키텍처 개요

- **Server Components (RSC)**: 초기 데이터 로딩, SEO, 보안이 필요한 데이터 페칭에 사용합니다.
- **Client Components**: 사용자 인터랙션, 실시간 데이터 갱신, 무한 스크롤 등에 React Query를 사용합니다.
- **Unified Mutation**: 데이터 변경(Mutation) 시 서버 캐시(Next.js)와 클라이언트 캐시(React Query)를 동시에 갱신합니다.

---

## 2. 데이터 조회 (Fetching)

### Server Components (RSC)

서버 컴포넌트에서는 `getServerApiConfig`를 사용하여 인증 쿠키를 포함한 요청을 보냅니다.

```typescript
// app/project/page.tsx
import { getApiProjects } from '@repo/api/hooks';
import { getServerApiConfig } from '@/web/shared/api/server';

export default async function ProjectListPage() {
  // 1. 서버 설정 가져오기 (쿠키 포함)
  const config = await getServerApiConfig();

  // 2. API 호출 (Next.js 캐시 옵션 사용 가능)
  const projects = await getApiProjects({
    ...config,
    next: { tags: ['projects'] }, // 캐시 무효화를 위한 태그 설정
    cache: 'force-cache',         // 기본값 (생략 가능)
  });

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Client Components (React Query)

클라이언트 컴포넌트에서는 Kubb가 생성한 React Query Hook을 그대로 사용합니다.
전역 설정으로 `staleTime: 1분`이 적용되어 있어, 초기 로딩 후 1분간은 캐시된 데이터를 사용합니다.

```typescript
// widgets/projectList/ui.tsx
'use client';

import { useGetApiProjects } from '@repo/api/hooks';

export const ProjectList = () => {
  const { data, isPending } = useGetApiProjects();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(project => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
};
```

---

## 3. 데이터 변경 (Mutation) & 캐시 무효화

데이터를 변경할 때는 **서버 캐시**와 **클라이언트 캐시**를 모두 무효화해야 데이터 불일치를 방지할 수 있습니다.
이를 위해 `useUnifiedMutation` 훅을 사용합니다.

### 사용법

```typescript
// features/createProject/model/useCreateProject.ts
import { useUnifiedMutation } from '@/web/shared/api/useUnifiedMutation';
import { usePostApiProjectsCreate } from '@repo/api/hooks';

export const useCreateProject = () => {
  const { mutateAsync } = usePostApiProjectsCreate();

  return useUnifiedMutation(mutateAsync, {
    // 1. 서버 캐시 무효화 (Next.js Cache Tag)
    // Server Component에서 next: { tags: ['projects'] }로 설정한 태그와 일치해야 함
    revalidateTag: 'projects',

    // 2. 클라이언트 캐시 무효화 (React Query Key)
    invalidateQueryKey: ['projects'],

    onSuccess: () => {
      console.log('프로젝트 생성 및 모든 캐시 갱신 완료');
    },
  });
};
```

### 캐싱 정책 (No-Cache Enforcement)

데이터 일관성을 위해 **GET 요청을 제외한 모든 요청(POST, PUT, DELETE)**은 API 클라이언트 레벨에서 강제로 `cache: 'no-store'`가 적용됩니다.
따라서 Mutation 요청은 절대 캐싱되지 않으며 항상 최신 상태로 서버에 도달합니다.

---

## 4. 요약

| 상황                  | 사용하는 도구                           | 예시                       |
| --------------------- | --------------------------------------- | -------------------------- |
| **초기 데이터 (SEO)** | Server Component + `getServerApiConfig` | `app/page.tsx`             |
| **인터랙티브 데이터** | React Query Hooks                       | `widgets/ProjectList.tsx`  |
| **데이터 생성/수정**  | `useUnifiedMutation`                    | `features/ProjectForm.tsx` |
