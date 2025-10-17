import * as imageService from './services';
import type { uploadImageSchema } from './interfaces';
import { z } from 'zod';

type UploadImageInput = z.infer<typeof uploadImageSchema>;

export const uploadImageController = async ({
  input,
}: {
  input: UploadImageInput;
}) => {
  try {
    return await imageService.uploadImage(input.fileName, input.fileType);
  } catch (error) {
    console.error('Error in uploadImageController:', error);
    throw error;
  }
};
