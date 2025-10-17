import { protectedProcedure, router } from '@/api/trpc';
import {
  createProjectSchema,
  deleteProjectSchema,
} from './interfaces';
import {
  createProjectController,
  deleteProjectController,
  listProjectsController,
} from './controllers';

export const projectsRouter = router({
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(createProjectController),
  delete: protectedProcedure
    .input(deleteProjectSchema)
    .mutation(deleteProjectController),
  list: protectedProcedure.query(listProjectsController),
});
