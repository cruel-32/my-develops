import { protectedProcedure, router } from '@/api/trpc';
import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
  getProjectSchema,
} from './interfaces';
import {
  createProjectController,
  deleteProjectController,
  listProjectsController,
  updateProjectController,
  getProjectController,
} from './controllers';

export const projectsRouter = router({
  get: protectedProcedure.input(getProjectSchema).query(getProjectController),
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(createProjectController),
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(updateProjectController),
  delete: protectedProcedure
    .input(deleteProjectSchema)
    .mutation(deleteProjectController),
  list: protectedProcedure.query(listProjectsController),
});
