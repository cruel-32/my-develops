# React 18 → 19 변경점 정리

이 프로젝트는 React 19.2 + React Compiler 1.0을 사용 중이다. React 18에서 19로 넘어오며 바뀐 핵심 내용을 정리한다.

## 1. Actions & 폼 처리

React 19의 가장 큰 변화. 비동기 상태 업데이트(pending, error, 결과값, 낙관적 업데이트)를 다루는 표준 패턴이 프레임워크 레벨로 들어왔다.

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
- **`startTransition`이 async 함수를 지원**: transition 내부에서 await 가능해짐 (React 18에서는 동기 함수만 가능했음).

이 프로젝트의 `loginForm`, `joinForm` 같은 React Hook Form + Zod + tRPC 조합은 그대로 유효하지만, 서버 상태를 직접 다루는 단순 폼(설정 저장 등)은 `useActionState`로 대체하면 보일러플레이트가 줄어든다.

## 2. `use()` API

Hook이 아닌 일반 함수처럼 조건문/반복문 안에서도 호출 가능한 새 API.

```tsx
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise); // Promise를 Suspense와 함께 unwrap
  ...
}

function Panel() {
  const theme = use(ThemeContext); // useContext 대체 가능, 조건부 호출 OK
}
```

- Promise를 넘기면 resolve될 때까지 가장 가까운 `<Suspense>`가 fallback을 보여줌.
- Context를 조건부로 읽을 때 `useContext`보다 유연함.

## 3. ref 관련 변화

- **`forwardRef`가 더 이상 필요 없음**: 함수 컴포넌트가 `ref`를 일반 prop처럼 직접 받을 수 있다.
  ```tsx
  function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & InputProps) {
    return <input ref={ref} {...props} />;
  }
  ```
  (`forwardRef`는 여전히 동작하지만 향후 deprecated 예정이라 신규 코드는 안 쓰는 걸 권장)
- **ref callback의 cleanup 함수 지원**: `ref={(node) => { ...; return () => { /* cleanup */ }; }}` 형태로 unmount/교체 시 정리 로직을 명시적으로 반환 가능.
- **`useDeferredValue(value, initialValue)`**: 초기 렌더 시 사용할 값을 지정 가능.

## 4. Document Metadata & Resource 로딩 지원

컴포넌트 트리 어디서든 아래 태그를 렌더링하면 React가 자동으로 `<head>`로 호이스팅한다.

```tsx
function BlogPost() {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={post.url} />
      ...
    </article>
  );
}
```

- **스타일시트 우선순위(`precedence`)**: `<link rel="stylesheet" href="..." precedence="default">` 형태로 로딩 순서 제어 + 중복 제거.
- **비동기 스크립트**: `<script async src="...">`를 트리 어디서든 렌더링해도 중복 실행 없이 한 번만 로드.
- Next.js App Router는 이미 자체 `metadata` API로 이 영역을 대부분 커버하므로, 이 프로젝트에서는 React 19 네이티브 metadata 태그보다 Next.js `generateMetadata`를 우선 사용하는 게 일관적이다.

## 5. Server Components / Server Actions 표준화

- React 18 시절 canary 기능이던 Server Components, Server Actions(`'use server'`)가 React 19에서 안정화.
- Next.js 15 App Router는 이를 기반으로 동작. `05c1444` 커밋에서 진행한 SSR/RSC 대응 작업과 직접 연결됨.
- 클라이언트 컴포넌트에서 서버 함수를 `import`해서 바로 호출하고, 내부적으로 fetch로 변환되는 구조.

## 6. 에러 처리 개선

- `createRoot(container, { onCaughtError, onUncaughtError, onRecoverableError })` 옵션 추가로 에러 리포팅을 세분화(ErrorBoundary가 잡은 에러 / 못 잡은 에러 / 복구 가능한 에러 구분).
- Hydration mismatch 에러 메시지가 훨씬 구체적으로 diff를 보여줌 (React 18은 generic warning).
- 중복 에러 로그가 줄어듦 (이전엔 동일 에러가 콘솔에 여러 번 찍히는 경우가 있었음).

## 7. Context 사용법 단순화

```tsx
// React 18
<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>

// React 19 — Provider 없이 Context 자체를 렌더링 가능
<ThemeContext value={theme}>{children}</ThemeContext>
```

`Context.Provider`는 계속 지원되지만 더 짧은 문법이 추가됨.

## 8. React Compiler (별도 배포, React 19와 함께 사용 권장)

- Babel 플러그인 형태(`babel-plugin-react-compiler`)로 컴파일 타임에 자동 메모이제이션(`useMemo`/`useCallback`/`memo` 자동 삽입)을 수행.
- 이 프로젝트는 `apps/web/next.config.ts`에서 `experimental.reactCompiler: true`로 전역 활성화 중.
- React 19 자체 기능은 아니지만 사실상 세트로 취급됨. 컴파일러가 강제하는 "순수 렌더링" 규칙 위반을 `eslint-plugin-react-hooks`가 린트 단계에서 잡아준다 (`purity`, `immutability`, `set-state-in-render` 등).

## 9. 제거되거나 Deprecated된 것들

React 18까지 쓰이던 아래 API들은 19에서 제거되었거나 경고 후 제거 예정이다.

| 항목 | 상태 | 대안 |
|---|---|---|
| `ReactDOM.render` | 제거됨 | `createRoot(...).render(...)` |
| `ReactDOM.hydrate` | 제거됨 | `hydrateRoot(...)` |
| `unmountComponentAtNode` | 제거됨 | `root.unmount()` |
| 클래스 컴포넌트의 문자열 ref (`ref="foo"`) | 제거됨 | callback ref 또는 `useRef` |
| 함수 컴포넌트의 `propTypes` / `defaultProps` | 제거됨(경고 없이 무시) | TypeScript 타입 + 파라미터 기본값 |
| Legacy Context API (`contextTypes`, `getChildContext`) | 제거됨 | `createContext` / `useContext` |
| `react-test-renderer` | Deprecated | React Testing Library 사용 (이 프로젝트는 이미 RTL 사용 중) |
| `createFactory` | 제거됨 | JSX 직접 사용 |
| Module pattern factories | 제거됨 | 함수/클래스 컴포넌트 |

## 10. 마이그레이션 시 실질적 체크리스트

1. `npx react-codemod` 관련 codemod로 자동 변환 가능한 부분(`forwardRef` 제거 등) 우선 적용 검토.
2. `propTypes`/`defaultProps`를 쓰는 레거시 컴포넌트가 있는지 검색 (`grep -rn "propTypes\|defaultProps" apps/web/src`).
3. 문자열 ref, `react-test-renderer` 사용처 확인.
4. `ReactDOM.render` 같은 레거시 진입점이 남아있는지 확인 (Next.js 사용 시 보통 해당 없음).
5. Suspense 경계 안에서 `use()`로 Promise를 unwrap하는 패턴 도입 검토 (특히 서버 데이터 스트리밍).
6. 새 폼/뮤테이션 로직 작성 시 `useActionState` + Server Actions 조합을 기본값으로 고려.

## 참고 자료

- https://react.dev/blog/2024/12/05/react-19
- https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- https://react.dev/reference/react/useActionState
- https://react.dev/reference/react/use
