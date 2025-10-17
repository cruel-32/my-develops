import { z } from 'zod';

export const uploadImageSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
});
