# React 개발 핵심 지식

React로 개발할 때 반드시 알아야 하는 개념을 우선순위 순으로 정리한다. 이 프로젝트(Next.js 15 App Router + React 19 + React Compiler + tRPC)를 기준으로 예시를 든다.

## 1. 렌더링 모델을 이해하기

- 컴포넌트는 "현재 state/props를 받아 UI를 계산하는 순수 함수"다. React는 이 함수를 다시 실행(re-render)해서 이전 결과와 비교(reconciliation)한 뒤, 실제로 바뀐 DOM만 갱신한다.
- **렌더링은 부수효과(side effect)가 없어야 한다.** 렌더 함수 본문에서 외부 변수 mutation, API 호출, `setState` 직접 호출을 하면 안 된다 → React Compiler의 `purity`, `set-state-in-render` 린트 규칙이 바로 이걸 강제한다.
- 리렌더 트리거는 3가지뿐: ① 자신의 state 변경, ② 부모의 리렌더(props 변화 여부와 무관하게 기본적으로 자식도 리렌더), ③ Context 값 변경(구독 중인 컴포넌트만).
- key가 바뀌면 컴포넌트는 "같은 컴포넌트의 업데이트"가 아니라 "새 컴포넌트의 마운트"로 취급된다 (state 완전 초기화). 리스트 렌더링뿐 아니라 의도적으로 상태를 리셋하고 싶을 때도 활용.

## 2. State와 Props의 원칙

- **단방향 데이터 흐름**: 데이터는 위(부모)에서 아래(자식)로만 props로 흐른다. 자식이 부모 상태를 바꾸려면 함수를 props로 받아 호출한다.
- **State는 최소한으로**: 다른 state/props로부터 계산 가능한 값은 state로 만들지 않는다. 렌더링 중 바로 계산하거나 `useMemo`로 캐시(단, React Compiler가 있으면 `useMemo`를 수동으로 안 써도 자동 처리됨).
- **State 끌어올리기(lifting state up)**: 두 형제 컴포넌트가 같은 데이터를 공유해야 하면 가장 가까운 공통 부모로 state를 옮긴다.
- **State는 불변으로 다룬다**: 배열/객체를 직접 mutate하지 말고 새 참조를 만들어 교체 (`items.push(x)` ❌ → `[...items, x]` ✅). React Compiler의 `immutability` 규칙이 이를 강제한다.

## 3. Hooks 규칙 (Rules of Hooks)

- 최상위 레벨에서만 호출 (조건문, 반복문, 중첩 함수 안에서 호출 금지).
- React 함수 컴포넌트나 커스텀 훅 안에서만 호출.
- 커스텀 훅은 이름이 반드시 `use`로 시작해야 lint 도구와 React Compiler가 훅으로 인식한다.
- 위반 시 `eslint-plugin-react-hooks`의 `rules-of-hooks` 규칙이 빌드 전에 잡아준다 — 이미 이 프로젝트에 적용되어 있음.

## 4. 자주 쓰는 훅과 용도

| 훅 | 용도 | 주의점 |
|---|---|---|
| `useState` | 로컬 UI 상태 | 파생 가능한 값은 담지 않기 |
| `useReducer` | 복잡한 state 전이 로직 | 여러 필드가 얽혀 갱신될 때 |
| `useEffect` | **외부 시스템과의 동기화** (구독, 타이머, 비-React 위젯) | "데이터 가져오기"용으로 남용하지 않기 (아래 5번 참고) |
| `useRef` | 렌더링에 영향 없는 값 저장, DOM 참조 | ref 값 변경은 리렌더를 유발하지 않음 |
| `useMemo` / `useCallback` | 비용이 큰 계산/함수 재생성 방지 | React Compiler 적용 시 대부분 자동화되므로 수동 작성 최소화 |
| `useContext` / `use(Context)` | 여러 레벨 아래 컴포넌트에 값 전달 (prop drilling 회피) | 값이 자주 바뀌면 구독 컴포넌트 전체가 리렌더됨 — 남용 주의 |
| `useActionState` / `useFormStatus` / `useOptimistic` | React 19의 폼/비동기 액션 상태 관리 | `docs/react-18-to-19-migration.md` 참고 |
| `useId` | SSR-safe한 고유 id 생성 | key 용도로 쓰지 말 것 |

## 5. `useEffect`를 오해하지 않기

가장 많이 오남용되는 훅. 아래 원칙만 기억하면 된다.

- **Effect는 "React 렌더링과 무관한 외부 시스템과 동기화"할 때만 쓴다.** (WebSocket 연결, `document.title` 설정, 서드파티 위젯 초기화 등)
- **다음 경우엔 Effect가 필요 없다**:
  - props/state로부터 값을 계산 → 렌더링 중 바로 계산
  - 사용자 이벤트에 대한 반응(제출, 클릭) → 이벤트 핸들러에서 처리
  - 다른 state가 바뀔 때 state를 "따라 업데이트" → 렌더링 중 계산하거나, 정말 필요하면 이벤트 핸들러에서 한 번에 처리
- **데이터 페칭을 `useEffect`로 직접 구현하지 않는다.** 이 프로젝트는 tRPC + React Query(`clientTrpc.xxx.useQuery()`)를 쓰므로 캐싱/재요청/race condition 처리를 라이브러리에 위임한다.
- Effect에 cleanup 함수를 반환하면 다음 실행 전 / unmount 시 호출된다 (구독 해제, 타이머 정리에 필수).
- 의존성 배열은 "정직하게" 채운다. eslint의 `exhaustive-deps` 경고를 임의로 무시(`// eslint-disable`)하지 말 것 — 대부분 로직 결함의 신호다.

## 6. 컴포넌트 설계

- **합성(Composition) > 상속**: React에는 클래스 상속 개념이 없다. 공통 UI는 `children`을 받는 wrapper 컴포넌트나 커스텀 훅으로 재사용한다.
- **Controlled vs Uncontrolled**: form input은 value+onChange로 React가 값을 소유(controlled)하거나, `ref`로 DOM이 값을 소유(uncontrolled)하게 한다. 이 프로젝트는 React Hook Form을 쓰므로 대부분 uncontrolled + ref 기반으로 성능 이점을 가져간다.
- **Error Boundary**: 렌더링 중 발생한 에러를 잡아 fallback UI를 보여주는 유일한 방법(현재는 클래스 컴포넌트로만 구현 가능). 페이지/위젯 단위 경계에 배치해 전체 앱 크래시를 방지한다.
- **Suspense**: 비동기 데이터/코드 로딩 중 fallback을 보여주는 선언적 방법. `use()` API, `React.lazy`, React Query의 `useSuspenseQuery`와 함께 쓴다.

## 7. Server Components vs Client Components (Next.js App Router)

- 기본은 **Server Component** (파일 상단에 `'use client'`가 없으면). 서버에서만 실행되고 브라우저 번들에 포함되지 않는다 — DB 직접 접근, 무거운 라이브러리에 유리.
- `'use client'`가 필요한 경우: `useState`/`useEffect` 등 훅 사용, 이벤트 핸들러(`onClick` 등), 브라우저 전용 API 사용.
- **경계는 최대한 아래로(leaf) 내린다.** 페이지 전체를 Client Component로 만들지 말고, 상호작용이 필요한 최소 단위만 분리.
- Server Component는 Client Component를 `children`으로 감쌀 수 있지만, 반대로 Client Component가 Server Component를 직접 import해서 렌더링할 수는 없다 (props로 내려받는 건 가능).

## 8. 성능에 대한 태도

- **먼저 측정, 그 다음 최적화.** React DevTools Profiler 없이 "느릴 것 같아서" 최적화하지 않는다.
- 이 프로젝트는 **React Compiler**가 자동 메모이제이션을 담당하므로 `useMemo`/`useCallback`/`React.memo`를 수동으로 남발할 필요가 없다. 컴파일러가 처리하지 못하는 경우(비순수 코드, 지원되지 않는 문법)는 `eslint-plugin-react-hooks`의 컴파일러 규칙이 경고해준다.
- 리스트 렌더링 시 `key`는 배열 index가 아니라 안정적인 고유 id를 사용한다 (index를 쓰면 항목 추가/삭제/정렬 시 state가 엉킨다).
- 큰 리스트/무거운 컴포넌트는 코드 스플리팅(`React.lazy` + `Suspense`)과 가상화(virtualization)를 고려.

## 9. 자주 하는 실수 (Anti-patterns)

- 렌더링 중 `setState` 직접 호출 → 무한 루프 위험, React Compiler가 에러로 잡음.
- `useEffect` 안에서 fetch 후 `setState`로 파생 상태 관리 → race condition, 워터폴 로딩 유발. React Query/tRPC 사용.
- props로 받은 객체/배열을 직접 mutate.
- 배열 index를 key로 사용.
- 불필요하게 깊은 prop drilling → Context나 컴포넌트 합성으로 해결.
- 모든 상태를 최상위 컴포넌트에 몰아넣기 → 관련된 state는 실제로 그것을 쓰는 컴포넌트 근처에 위치(state colocation).
- `useEffect` 의존성 배열 경고를 임의로 끄기.

## 10. 이 프로젝트에서 지켜야 할 추가 규칙

- **Feature-Sliced Design 레이어 규칙 준수**: `app → pages → widgets → features → entities → shared` 방향으로만 import (`CLAUDE.md`, `pnpm steiger` 참고).
- **타입 안전성은 tRPC가 담당**: 프론트엔드에서 API 응답 타입을 직접 정의하지 말고 `AppRouter` 추론 타입을 사용.
- **폼은 React Hook Form + Zod + tRPC mutation** 패턴을 따른다 (`features/loginForm` 참고).
- React Compiler가 켜져 있으므로 컴포넌트는 순수 함수로 작성하고, 조건부 훅 호출·렌더링 중 mutation 같은 패턴을 피한다.

## 참고 자료

- https://react.dev/learn (공식 튜토리얼, 최신 멘탈 모델 기준)
- https://react.dev/learn/thinking-in-react
- https://react.dev/reference/rules
- https://react.dev/learn/you-might-not-need-an-effect
