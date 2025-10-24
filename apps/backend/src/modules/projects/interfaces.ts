import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  public: z.boolean(),
  imgId: z.string().optional(),
});

export const deleteProjectSchema = z.object({
  id: z.string().transform(Number),
});

export const updateProjectSchema = z.object({
  id: z.string().transform(Number),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  public: z.boolean().optional(),
  imgId: z.string().optional(),
});

export const getProjectSchema = z.object({
  id: z.string().transform(Number),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetProjectInput = z.infer<typeof getProjectSchema>;
