import { type CreatePostRequest, type DeleteImageRequest } from './routes';
import { type Response } from 'express';
import * as imageService from './services';

export const uploadImageController = async (
  req: CreatePostRequest,
  res: Response
) => {
  try {
    const { fileName, filePath, fileType } = req.body;
    const result = await imageService.uploadImage(fileName, filePath, fileType);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in uploadImageController:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteImageController = async (
  req: DeleteImageRequest,
  res: Response
) => {
  try {
    const { imgId } = req.params;
    await imageService.deleteImage(imgId);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteImageController:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
