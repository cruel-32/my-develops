# React 17 → 18 → 19 변경점 정리

이 프로젝트는 React 19.2 + React Compiler 1.0을 사용 중이다. React 17부터 19까지 세 메이저 버전에 걸쳐 무엇이 바뀌었는지 항목별로 비교하고, 마지막에 **Next.js에서만 통용되는 변경점**을 별도로 정리한다.

## 1. 렌더링 모델 & 루트 API

| 항목 | React 17 | React 18 | React 19 |
|---|---|---|---|
| 렌더링 방식 | 동기(synchronous) 렌더링만 존재 | **Concurrent Rendering** 도입 (렌더링을 중단·재개·우선순위 조정 가능) | 18의 concurrent 아키텍처 유지, 안정화 |
| 루트 생성 | `ReactDOM.render(el, container)` | `createRoot(container).render(el)` / `hydrateRoot` 신규 도입 (기존 `render`는 경고와 함께 계속 동작) | `ReactDOM.render` / `hydrate` / `unmountComponentAtNode` **완전 제거** — `createRoot`/`hydrateRoot` 필수 |
| 이벤트 위임 위치 | `document`에 위임 | 루트 컨테이너에 위임 (17에서 이미 변경됨, 유지) | 동일 |
| state 업데이트 배칭 | 이벤트 핸들러 내부만 자동 배칭 | **자동 배칭 범위 확장** (Promise, `setTimeout`, native 이벤트 핸들러 등 어디서든 배칭) | 동일 |

## 2. Hooks 변화

| 항목 | React 17 | React 18 | React 19 |
|---|---|---|---|
| 신규 훅 | 없음 (16.8의 기본 훅 세트 유지) | `useId`, `useTransition`, `useDeferredValue`, `useSyncExternalStore`, `useInsertionEffect` 추가 | `useActionState`, `useFormStatus`, `useOptimistic`, `use()` 추가 |
| `useTransition` / `startTransition` | 없음 | 동기 함수만 지원 | **async 함수 지원** (transition 내부에서 `await` 가능) |
| `useDeferredValue` | 없음 | `useDeferredValue(value)` | `useDeferredValue(value, initialValue)` — 초기 렌더 값 지정 가능 |
| `use()` | 없음 | 없음 | **신규.** 훅 규칙 예외 — 조건문/반복문 안에서도 호출 가능. Promise를 Suspense와 함께 unwrap, Context를 조건부로 읽기 가능 |

```tsx
// React 19 — use()로 Promise를 조건부/반복문 안에서도 unwrap 가능
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);
  ...
}
```

## 3. Actions & 폼 처리 (React 19의 가장 큰 변화)

- React 17·18에는 이 개념 자체가 없었다. 비동기 제출 상태(pending/error/결과)는 항상 직접 `useState` + `useEffect`로 구현하거나 React Hook Form 같은 라이브러리에 의존해야 했다.
- React 19에서 표준화됨:
  - **`useActionState`**: form action에 연결해 pending 상태와 반환값을 관리.
    ```tsx
    const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
      const result = await updateName(formData.get('name'));
      if (result.error) return result.error;
      return null;
    }, null);
    ```
  - **`useFormStatus`**: 부모 `<form>`의 제출 상태를 자식 컴포넌트에서 prop drilling 없이 조회.
  - **`useOptimistic`**: 서버 응답 전에 낙관적 UI 상태를 보여주고 실제 결과로 되돌리거나 확정.
  - **`<form action={fn}>`**: form에 함수를 직접 바인딩 가능. 제출 후 자동으로 uncontrolled input 초기화.

## 4. ref 관련 변화

| 항목 | React 17 / 18 | React 19 |
|---|---|---|
| 함수 컴포넌트가 `ref` 받기 | `forwardRef`로 감싸야만 가능 | **`ref`를 일반 prop처럼 직접 받을 수 있음** (`forwardRef`는 계속 동작하지만 신규 코드에는 비권장) |
| ref callback cleanup | cleanup 없음 (unmount 시 `null` 호출만) | ref callback이 함수를 반환하면 unmount/교체 시 그 함수가 cleanup으로 호출됨 |

```tsx
// React 19
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & InputProps) {
  return <input ref={ref} {...props} />;
}
```

## 5. Context 사용법

| React 17 / 18 | React 19 |
|---|---|
| `<Context.Provider value={v}>` 만 가능 | `<Context.Provider>`는 유지되며, **`<Context value={v}>`로 축약 가능**해짐 |

## 6. Suspense & 데이터 로딩

| 항목 | React 17 | React 18 | React 19 |
|---|---|---|---|
| Suspense 지원 범위 | `React.lazy`(코드 스플리팅)만 공식 지원, 데이터 페칭용 Suspense는 실험적 | SSR 스트리밍 + 선택적 하이드레이션(selective hydration)으로 서버에서도 Suspense 경계 단위 스트리밍 가능 | `use()` API로 **Promise를 직접 Suspense와 연동**하는 것이 공식 패턴으로 자리잡음 |

## 7. Document Metadata & Resource 로딩 지원 (React 19 신규)

React 17·18에는 없던 기능. 컴포넌트 트리 어디서든 아래 태그를 렌더링하면 React가 자동으로 `<head>`로 호이스팅한다.

```tsx
function BlogPost() {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={post.url} />
    </article>
  );
}
```

- **스타일시트 우선순위(`precedence`)**: `<link rel="stylesheet" href="..." precedence="default">` 형태로 로딩 순서 제어 + 중복 제거.
- **비동기 스크립트**: `<script async src="...">`를 트리 어디서든 렌더링해도 중복 실행 없이 한 번만 로드.

## 8. Server Components / Server Actions 표준화

- React 17: 개념 자체 없음.
- React 18: canary 채널에서 실험적으로 존재 (Next.js 13 등이 canary React를 끌어다 먼저 사용).
- React 19: **정식 안정화**. 클라이언트 컴포넌트에서 `'use server'` 함수를 `import`해서 바로 호출하고, 내부적으로 fetch로 변환되는 구조가 코어 React API로 편입됨.

## 9. 에러 처리 개선

| React 17 | React 18 | React 19 |
|---|---|---|
| 에러 바운더리만 존재, 콘솔 로그는 단순 | 동일 + Strict Mode에서 개발 모드 double-invoke(렌더 함수, effect를 두 번 실행)로 부수효과를 조기에 노출 | `createRoot(container, { onCaughtError, onUncaughtError, onRecoverableError })` 옵션으로 **에러 종류별 세분화된 리포팅**. Hydration mismatch 에러 메시지가 구체적인 diff를 보여줌. 중복 에러 로그 감소 |

## 10. React Compiler (React 19 생태계, 코어 기능은 아님)

- Babel 플러그인(`babel-plugin-react-compiler`)으로 컴파일 타임에 자동 메모이제이션(`useMemo`/`useCallback`/`memo` 자동 삽입)을 수행.
- React 17·18에는 대응 도구가 없었다 (수동 메모이제이션에 의존).
- 엄밀히는 React 19 자체 기능이 아니지만, React 19의 안정적인 컴파일 타깃(정적 분석 가능한 순수 컴포넌트 규칙)을 전제로 만들어져 사실상 세트로 취급된다.
- 이 프로젝트는 `apps/web/next.config.ts`에서 `experimental.reactCompiler: true`로 전역 활성화 중이며, `eslint-plugin-react-hooks`가 컴파일러 규칙(`purity`, `immutability`, `set-state-in-render` 등)을 린트 단계에서 강제한다.

## 11. 제거되거나 Deprecated된 것들

### React 18에서 일어난 변화 (17 대비)
- `ReactDOM.render` / `hydrate` / `unmountComponentAtNode`가 **deprecated**(콘솔 경고, 아직 동작함) — `createRoot`/`hydrateRoot` 사용 권장으로 전환.
- 그 외 API 제거는 없음 (18은 대부분 additive한 릴리스).

### React 19에서 제거된 것 (18 대비)
| 항목 | 상태 | 대안 |
|---|---|---|
| `ReactDOM.render` | 완전 제거 (에러 발생) | `createRoot(...).render(...)` |
| `ReactDOM.hydrate` | 완전 제거 | `hydrateRoot(...)` |
| `unmountComponentAtNode` | 완전 제거 | `root.unmount()` |
| 클래스 컴포넌트의 문자열 ref (`ref="foo"`) | 제거됨 | callback ref 또는 `useRef` |
| 함수 컴포넌트의 `propTypes` / `defaultProps` | 제거됨(설정해도 무시) | TypeScript 타입 + 파라미터 기본값 |
| Legacy Context API (`contextTypes`, `getChildContext`) | 제거됨 | `createContext` / `useContext` |
| `react-test-renderer` | Deprecated (동작은 함) | React Testing Library 사용 |
| `createFactory` | 제거됨 | JSX 직접 사용 |
| Module pattern factories | 제거됨 | 함수/클래스 컴포넌트 |

## 12. 마이그레이션 시 실질적 체크리스트

1. 현재 17 또는 18에서 출발한다면, 먼저 `createRoot`/`hydrateRoot`로 루트 API를 전환했는지 확인 (18에서 미리 해두면 19 전환이 수월함).
2. `propTypes`/`defaultProps`를 쓰는 레거시 컴포넌트가 있는지 검색 (`grep -rn "propTypes\|defaultProps" apps/web/src`).
3. 문자열 ref, `react-test-renderer` 사용처 확인.
4. `forwardRef`로만 감싸져 있던 컴포넌트를 `ref`를 일반 prop으로 받는 방식으로 점진적 전환 검토.
5. Suspense 경계 안에서 `use()`로 Promise를 unwrap하는 패턴 도입 검토 (특히 서버 데이터 스트리밍).
6. 새 폼/뮤테이션 로직 작성 시 `useActionState` + Server Actions 조합을 기본값으로 고려.

---

## Next.js 전용 변경점

아래는 **React 자체의 변경이 아니라, React 19를 채택하며 Next.js(15) 쪽에서 추가/변경된 사항**이다. 다른 React 19 호스트 환경(Vite, Remix 등)에는 해당하지 않는다.

- **React 19가 App Router의 필수 요구사항이 됨**: Next.js 15의 App Router는 React 19를 강제한다 (Pages Router만 쓰는 경우 React 18 유지 가능). 이 프로젝트는 App Router 기반이므로 React 19가 필수.
- **Async Dynamic APIs**: `cookies()`, `headers()`, `draftMode()`와 페이지의 `params`, `searchParams`가 **Promise를 반환하도록 변경**되어 `await`가 필요해졌다. React 19 자체 API는 아니지만, Next.js가 Server Components 스트리밍 아키텍처를 React 19에 맞춰 재설계하며 함께 도입한 변경.
- **`fetch` 캐싱 기본값 변경**: Next.js 15부터 `fetch` 요청, GET Route Handler, 클라이언트 라우터 캐시가 **기본적으로 캐시되지 않음** (필요 시 `cache: 'force-cache'` 등으로 명시적 opt-in). React 19와 무관한 Next.js 자체 정책 변경.
- **Turbopack(`next dev --turbopack`) 안정화**: 이 프로젝트의 `dev` 스크립트가 사용 중. React 19와 별개로 Next.js 15에서 진행된 번들러 교체.
- **Server Actions 보안 강화**: 사용하지 않는 Server Action에 대한 dead-code elimination, 요청 origin 검증 등 CSRF 방어가 Next.js 레벨에서 추가됨 (React 19의 Server Actions 코어 기능 위에 Next.js가 얹은 것).
- **Metadata API 우선순위**: React 19는 컴포넌트 트리 어디서든 `<title>`/`<meta>`를 렌더링할 수 있게 됐지만, Next.js App Router에서는 SEO/스트리밍 일관성을 위해 여전히 Next.js 자체 `generateMetadata`/`metadata` export 사용을 우선 권장한다.
- **React Compiler 연동 지점**: React Compiler는 React 코어 기능이 아니지만, Next.js는 `next.config.ts`의 `experimental.reactCompiler` 플래그로 이를 켜고 끌 수 있는 통합 지점을 제공한다 (이 프로젝트가 사용 중인 방식).

## 참고 자료

- https://react.dev/blog/2024/12/05/react-19
- https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- https://react.dev/blog/2022/03/29/react-v18
- https://react.dev/reference/react/useActionState
- https://react.dev/reference/react/use
- https://nextjs.org/blog/next-15
- https://nextjs.org/docs/app/guides/upgrading/version-15
