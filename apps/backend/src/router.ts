import { Router } from 'express';
import { authRouter } from '@/be/modules/auth/routes';
import { imagesRouter } from '@/be/modules/images/routes';
import { operatorRolesRouter } from '@/be/modules/operator_roles/routes';
import { projectsRouter } from '@/be/modules/projects/routes';
import { usersRouter } from '@/be/modules/users/routes';

const appRouter: Router = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/images', imagesRouter);
appRouter.use('/operator-roles', operatorRolesRouter);
appRouter.use('/projects', projectsRouter);
appRouter.use('/users', usersRouter);

export { appRouter };
