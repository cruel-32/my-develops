import { type CreatePostRequest, type DeleteImageRequest } from './routes';
import { type Response } from 'express';
import * as imageService from './services';

export const uploadImageController = async (
  req: CreatePostRequest,
  res: Response
) => {
  const { fileName, filePath, fileType } = req.body;
  const result = await imageService.uploadImage(fileName, filePath, fileType);
  res.status(201).json(result);
};

export const deleteImageController = async (
  req: DeleteImageRequest,
  res: Response
) => {
  const { imgId } = req.params;
  const result = await imageService.deleteImage(imgId);
  res.json(result);
};
