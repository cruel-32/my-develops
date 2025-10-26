import { z } from 'zod';
import { getApiProjectsQueryResponseSchema } from '@repo/api/zod';

export const projectListSchema = getApiProjectsQueryResponseSchema;

export type ProjectList = z.infer<typeof projectListSchema>;
