import { z } from 'zod';

export const uploadImageSchema = z.object({
  fileName: z.string(),
  filePath: z.string(),
  fileType: z.string(),
});

export const deleteImageSchema = z.object({
  imgId: z.string().uuid(),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type DeleteImageInput = z.infer<typeof deleteImageSchema>;
