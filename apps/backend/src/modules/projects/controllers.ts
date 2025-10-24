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
  try {
    const result = await projectService.createProject(req.body, req.user!.id);
    res.json(result);
  } catch (error) {
    console.error('Error in createProjectController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProjectController = async (
  req: UpdateProjectRequest,
  res: Response
) => {
  try {
    const result = await projectService.updateProject(
      { ...req.body, id: req.params.id },
      req.user!
    );
    res.json(result);
  } catch (error) {
    console.error('Error in updateProjectController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProjectController = async (
  req: DeleteProjectRequest,
  res: Response
) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user!);
    res.json(result);
  } catch (error) {
    console.error('Error in deleteProjectController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectController = async (
  req: GetProjectRequest,
  res: Response
) => {
  try {
    const result = await projectService.getProject(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error in getProjectController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listProjectsController = async (req: Request, res: Response) => {
  try {
    const result = await projectService.listProjects(req.user!);
    res.json(result);
  } catch (error) {
    console.error('Error in listProjectsController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
