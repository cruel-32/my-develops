import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  public: z.boolean(),
  imgId: z.string().uuid().optional(),
});

export const deleteProjectSchema = z.object({
  id: z.number(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export const updateProjectSchema = createProjectSchema.extend({
  id: z.number(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const getProjectSchema = z.object({
  id: z.number(),
});
