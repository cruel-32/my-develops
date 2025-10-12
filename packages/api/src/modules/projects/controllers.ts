import * as projectService from './services';
import type { CreateProjectInput, DeleteProjectInput } from './interfaces';

export const createProjectController = async ({
  input,
  ctx,
}: {
  input: CreateProjectInput;
  ctx: { user: { id: number } };
}) => {
  return await projectService.createProject(input, ctx.user.id);
};

export const deleteProjectController = async ({
  input,
  ctx,
}: {
  input: DeleteProjectInput;
  ctx: { user: { id: number } };
}) => {
  return await projectService.deleteProject(input.id, ctx.user.id);
};

export const listProjectsController = async ({
  ctx,
}: {
  ctx: { user: { id: number } };
}) => {
  return await projectService.listProjects(ctx.user.id);
};
