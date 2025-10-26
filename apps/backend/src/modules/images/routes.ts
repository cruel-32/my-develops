import { Router } from 'express';

import validate, { type ValidatedRequest } from 'express-zod-safe';
import { uploadImageController, deleteImageController } from './controllers';
import { uploadImageSchema, deleteImageSchema } from './interfaces';
import { authenticate } from '@/be/middlewares';

const router: Router = Router();

/**
 * @description 모든 API 응답 형식
 *
 * Success Response (2xx):
 * {
 *   ... 각 엔드포인트의 데이터
 * }
 *
 * Error Response (4xx, 5xx):
 * {
 *   "error": "에러 메시지",
 *   "statusCode": HTTP 상태 코드
 * }
 */

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     tags: [Images]
 *     summary: S3 Presigned URL 생성
 *     description: 클라이언트가 S3에 이미지를 직접 업로드할 수 있는 Presigned URL을 생성하고 이미지 레코드를 저장합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, filePath, fileType]
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: 파일 이름
 *               filePath:
 *                 type: string
 *                 description: S3 폴더 경로
 *               fileType:
 *                 type: string
 *                 description: MIME type
 *     responses:
 *       201:
 *         description: Presigned URL 생성 및 이미지 레코드 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [presignedUrl, imgId]
 *               properties:
 *                 presignedUrl:
 *                   type: object
 *                   required: [url, fields]
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: S3 Presigned URL
 *                     fields:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       description: POST form에 포함할 필드 (key, policy, signature 등)
 *                       example:
 *                         key: projects/example.jpg
 *                         policy: eyJleXBpcmF0aW9uIjoiMjAyNS0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxMDQ4NTc2MF1dfQ==
 *                         signature: wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY
 *                 imgId:
 *                   type: string
 *                   format: uuid
 *                   description: 생성된 이미지 레코드 ID
 *       400:
 *         description: 사용자 데이터 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *       500:
 *         description: 이미지 레코드 생성 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
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
 *     description: S3에서 이미지 파일을 삭제하고 데이터베이스의 이미지 레코드를 삭제합니다
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedImageId:
 *                   type: string
 *                   format: uuid
 *                   description: 삭제된 이미지 ID
 *       404:
 *         description: 이미지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *       400:
 *         description: 검증 실패 (이미지 URL 손상 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                 statusCode:
 *                   type: number
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
