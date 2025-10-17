import * as imageService from './services';
import type { uploadImageSchema, deleteImageSchema } from './interfaces';
import { z } from 'zod';

type UploadImageInput = z.infer<typeof uploadImageSchema>;
type DeleteImageInput = z.infer<typeof deleteImageSchema>;

export const uploadImageController = async ({
  input,
}: {
  input: UploadImageInput;
}) => {
  try {
    return await imageService.uploadImage(
      input.fileName,
      input.filePath,
      input.fileType
    );
  } catch (error) {
    console.error('Error in uploadImageController:', error);
    throw error;
  }
};

export const deleteImageController = async ({
  input,
}: {
  input: DeleteImageInput;
}) => {
  try {
    return await imageService.deleteImage(input.imgId);
  } catch (error) {
    console.error('Error in deleteImageController:', error);
    throw error;
  }
};
