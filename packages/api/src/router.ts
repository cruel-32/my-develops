import { router } from '@/api/trpc';
import { usersRouter } from '@/api/modules/users/routes';
import { projectsRouter } from '@/api/modules/projects/routes';
import { operatorRolesRouter } from '@/api/modules/operator_roles/routes';

export const appRouter = router({
  // user 모듈의 라우터를 'user' 네임스페이스 아래에 통합합니다.
  // 클라이언트에서는 `trpc.users.signUp.mutate()` 와 같이 호출하게 됩니다.
  users: usersRouter,
  projects: projectsRouter,
  operatorRoles: operatorRolesRouter,
});

export type AppRouter = typeof appRouter;
