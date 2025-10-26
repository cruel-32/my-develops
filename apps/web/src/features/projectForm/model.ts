'use client';

import {
  postApiProjectsCreateMutationRequestSchema,
  putApiProjectsIdMutationRequestSchema,
} from '@/web/shared/model';

import { z } from 'zod';

export const createProjectSchema = postApiProjectsCreateMutationRequestSchema;

export const updateProjectSchema = putApiProjectsIdMutationRequestSchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
