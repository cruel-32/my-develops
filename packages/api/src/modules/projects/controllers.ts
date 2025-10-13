import * as projectService from './services';
import type { CreateProjectInput, DeleteProjectInput } from './interfaces';

export const createProjectController = async ({
  input,
  ctx,
}: {
  input: CreateProjectInput;
  ctx: { user: { id: number } };
}) => {
  try {
    return await projectService.createProject(input, ctx.user.id);
  } catch (error) {
    console.error('Error in createProjectController:', error);
    throw error;
  }
};

export const deleteProjectController = async ({
  input,
  ctx,
}: {
  input: DeleteProjectInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  try {
    return await projectService.deleteProject(input.id, ctx.user);
  } catch (error) {
    console.error('Error in deleteProjectController:', error);
    throw error;
  }
};

export const listProjectsController = async ({
  ctx,
}: {
  ctx: { user: { id: number; role?: string } };
}) => {
  try {
    return await projectService.listProjects(ctx.user);
  } catch (error) {
    console.error('Error in listProjectsController:', error);
    throw error;
  }
};
