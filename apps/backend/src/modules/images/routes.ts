import { Router } from 'express';

import validate, { type ValidatedRequest } from 'express-zod-safe';
import { uploadImageController, deleteImageController } from './controllers';
import { uploadImageSchema, deleteImageSchema } from './interfaces';
import { authenticate } from '@/be/middlewares/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     tags: [Images]
 *     summary: 이미지 업로드
 *     description: 새로운 이미지를 업로드합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *               fileName:
 *                 type: string
 *                 description: 파일 이름
 *               fileType:
 *                 type: string
 *                 description: 파일 타입
 *     responses:
 *       201:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 fileName:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                 fileType:
 *                   type: string
 *                 fileSize:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청 또는 지원하지 않는 파일 형식
 *       401:
 *         description: 인증 실패
 *       413:
 *         description: 파일 크기 초과
 */
export type CreatePostRequest = ValidatedRequest<{
  body: typeof uploadImageSchema;
}>;

/**
 * @swagger
 * /api/images/{imgId}:
 *   delete:
 *     tags: [Images]
 *     summary: 이미지 삭제
 *     description: 특정 이미지를 삭제합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 이미지 ID
 *     responses:
 *       200:
 *         description: 이미지 삭제 성공
 *       404:
 *         description: 이미지를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
export type DeleteImageRequest = ValidatedRequest<{
  params: typeof deleteImageSchema;
}>;

/**
 * @swagger
 * /api/images/list:
 *   get:
 *     tags: [Images]
 *     summary: 이미지 목록 조회
 *     description: 사용자가 업로드한 이미지 목록을 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 이미지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       fileName:
 *                         type: string
 *                       filePath:
 *                         type: string
 *                       fileType:
 *                         type: string
 *                       fileSize:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 실패
 */

/**
 * @swagger
 * /api/images/{imgId}:
 *   get:
 *     tags: [Images]
 *     summary: 이미지 조회
 *     description: 특정 이미지의 정보를 조회합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 이미지 ID
 *     responses:
 *       200:
 *         description: 이미지 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 fileName:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                 fileType:
 *                   type: string
 *                 fileSize:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 이미지를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */

router.post(
  '/upload',
  authenticate,
  validate({ body: uploadImageSchema }),
  uploadImageController
);

router.delete(
  '/:imgId',
  authenticate,
  validate({ params: deleteImageSchema }),
  deleteImageController
);

export { router as imagesRouter };
