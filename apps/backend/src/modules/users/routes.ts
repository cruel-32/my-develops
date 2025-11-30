import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  getApiUsersIdPathParamsSchema,
  putApiUsersIdMutationRequestSchema,
  deleteApiUsersIdPathParamsSchema,
} from '@repo/api/zod';
import {
  getMeController,
  getUserController,
  updateUserController,
  deleteUserController,
  listUsersController,
} from './controllers';
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
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: 현재 사용자 정보 조회
 *     description: 현재 로그인한 사용자의 정보를 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       401:
 *         description: 인증 실패
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 사용자 조회
 *     description: 특정 사용자의 정보를 조회합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
export type GetUserRequest = ValidatedRequest<{
  params: typeof getApiUsersIdPathParamsSchema;
}>;

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: 사용자 수정
 *     description: 특정 사용자의 정보를 수정합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               picture:
 *                 type: string
 *                 description: 사용자 프로필 사진
 *     responses:
 *       200:
 *         description: 사용자 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
export type UpdateUserRequest = ValidatedRequest<{
  params: typeof getApiUsersIdPathParamsSchema;
  body: typeof putApiUsersIdMutationRequestSchema;
}>;

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 사용자 삭제
 *     description: 특정 사용자 계정을 삭제합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
export type DeleteUserRequest = ValidatedRequest<{
  params: typeof deleteApiUsersIdPathParamsSchema;
}>;

/**
 * @swagger
 * /api/users/list:
 *   get:
 *     tags: [Users]
 *     summary: 사용자 목록 조회
 *     description: 시스템의 모든 사용자 목록을 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */

router.get('/me', authenticate, getMeController);

router.get(
  '/:id',
  authenticate,
  validate({ params: getApiUsersIdPathParamsSchema }),
  getUserController
);

router.put(
  '/:id',
  authenticate,
  validate({
    params: getApiUsersIdPathParamsSchema,
    body: putApiUsersIdMutationRequestSchema,
  }),
  updateUserController
);

router.delete(
  '/:id',
  authenticate,
  validate({ params: deleteApiUsersIdPathParamsSchema }),
  deleteUserController
);

router.get('/list', authenticate, listUsersController);

export { router as usersRouter };
