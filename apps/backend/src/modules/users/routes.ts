import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from './interfaces';
import {
  getMeController,
  getUserController,
  updateUserController,
  deleteUserController,
  listUsersController,
} from './controllers';
import { authenticate } from '@/be/middlewares/auth';

const router: Router = Router();

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
 *           type: string
 *           format: uuid
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
 *                   type: string
 *                   format: uuid
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
  params: typeof getUserSchema;
}>;

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     tags: [Users]
 *     summary: 사용자 수정
 *     description: 현재 사용자의 정보를 수정합니다
 *     security:
 *       - BearerAuth: []
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
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *     responses:
 *       200:
 *         description: 사용자 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
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
 *       409:
 *         description: 이미 존재하는 이메일
 */
export type UpdateUserRequest = ValidatedRequest<{
  body: typeof updateUserSchema;
}>;

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     tags: [Users]
 *     summary: 사용자 삭제
 *     description: 현재 사용자 계정을 삭제합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: 사용자 ID
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
  body: typeof deleteUserSchema;
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
 *                         type: string
 *                         format: uuid
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

router.get('/me', getMeController);

router.get(
  '/:id',
  authenticate,
  validate({ params: getUserSchema }),
  getUserController
);

router.put(
  '/update',
  authenticate,
  validate({ body: updateUserSchema }),
  updateUserController
);

router.delete(
  '/delete',
  authenticate,
  validate({ body: deleteUserSchema }),
  deleteUserController
);

router.get('/list', authenticate, listUsersController);

export { router as usersRouter };
