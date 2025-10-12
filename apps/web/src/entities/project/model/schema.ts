import { z } from 'zod';

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  public: z.boolean(),
  description: z.string(),
  imageUrl: z.string(),
  ownerId: z.number(),
});

export type Project = z.infer<typeof projectSchema>;
