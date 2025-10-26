import { Request, Response } from 'express';
import * as projectService from './services';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  DeleteProjectRequest,
  GetProjectRequest,
} from './routes';

export const createProjectController = async (
  req: CreateProjectRequest,
  res: Response
) => {
  const result = await projectService.createProject(req.body, req.user!.id);
  res.status(201).json({ ...result });
};

export const updateProjectController = async (
  req: UpdateProjectRequest,
  res: Response
) => {
  const result = await projectService.updateProject(
    { ...req.body, id: req.params.id },
    req.user!
  );
  res.json({ ...result });
};

export const deleteProjectController = async (
  req: DeleteProjectRequest,
  res: Response
) => {
  const result = await projectService.deleteProject(req.params.id, req.user!);
  res.json(result);
};

export const getProjectController = async (
  req: GetProjectRequest,
  res: Response
) => {
  const result = await projectService.getProject(req.params.id);
  res.json({ ...result });
};

export const listProjectsController = async (req: Request, res: Response) => {
  const result = await projectService.listProjects(req.user!);
  res.json(result);
};
