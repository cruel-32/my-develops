import { z } from 'zod';
import {
  getApiProjectsId200Schema,
  getApiProjects200Schema,
} from '@repo/api/zod';

export const projectSchema = getApiProjectsId200Schema;
export const projectListSchema = getApiProjects200Schema;

export type Project = z.infer<typeof projectSchema>;
export type ProjectList = z.infer<typeof projectListSchema>;
