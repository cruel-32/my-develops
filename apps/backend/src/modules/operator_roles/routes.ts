import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  createOperatorRoleSchema,
  deleteOperatorRoleSchema,
} from './interfaces';
import {
  createOperatorRoleController,
  deleteOperatorRoleController,
  listOperatorRolesController,
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
 * /api/operator-roles/create:
 *   post:
 *     tags: [Operator Roles]
 *     summary: 운영자 역할 생성
 *     description: 사용자에게 특정 역할을 할당합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, roleId]
 *             properties:
 *               userId:
 *                 type: number
 *                 description: 사용자 ID
 *               roleId:
 *                 type: number
 *                 description: 역할 ID
 *     responses:
 *       201:
 *         description: 운영자 역할 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 userId:
 *                   type: number
 *                 roleId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자 또는 역할을 찾을 수 없음
 *       409:
 *         description: 이미 존재하는 역할 할당
 */
export type CreateOperatorRoleRequest = ValidatedRequest<{
  body: typeof createOperatorRoleSchema;
}>;

/**
 * @swagger
 * /api/operator-roles/{userId}/{roleId}:
 *   delete:
 *     tags: [Operator Roles]
 *     summary: 운영자 역할 삭제
 *     description: 사용자로부터 특정 역할을 제거합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 역할 ID
 *     responses:
 *       200:
 *         description: 운영자 역할 삭제 성공
 *       404:
 *         description: 역할 할당을 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
export type DeleteOperatorRoleRequest = ValidatedRequest<{
  params: typeof deleteOperatorRoleSchema;
}>;

/**
 * @swagger
 * /api/operator-roles/list:
 *   get:
 *     tags: [Operator Roles]
 *     summary: 운영자 역할 목록 조회
 *     description: 모든 운영자 역할 할당 목록을 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 운영자 역할 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 operatorRoles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       userId:
 *                         type: number
 *                       roleId:
 *                         type: number
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */

export type ListOperatorRolesRequest = ValidatedRequest<{}>;

router.post(
  '/create',
  authenticate,
  validate({ body: createOperatorRoleSchema }),
  createOperatorRoleController
);

router.delete(
  '/:userId/:roleId',
  authenticate,
  validate({ params: deleteOperatorRoleSchema }),
  deleteOperatorRoleController
);

router.get('/list', authenticate, listOperatorRolesController);

export { router as operatorRolesRouter };
