import { type UploadImageRequest, type DeleteImageRequest } from './routes';
import { type Response } from 'express';
import * as imageService from './services';

export const uploadImageController = async (
  req: UploadImageRequest,
  res: Response
) => {
  const result = await imageService.uploadImage(req.body);
  res.status(201).json(result);
};

export const deleteImageController = async (
  req: DeleteImageRequest,
  res: Response
) => {
  const result = await imageService.deleteImage(req.params);
  res.json(result);
};
