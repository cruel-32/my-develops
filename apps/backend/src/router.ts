import { router } from '@/trpc';
import { userRouter } from './modules/user/routes';

export const appRouter = router({
  // user 모듈의 라우터를 'user' 네임스페이스 아래에 통합합니다.
  // 클라이언트에서는 `trpc.user.signUp.mutate()` 와 같이 호출하게 됩니다.
  user: userRouter,
});

export type AppRouter = typeof appRouter;
