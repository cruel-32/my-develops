import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
  getProjectSchema,
} from './interfaces';
import {
  createProjectController,
  deleteProjectController,
  listProjectsController,
  updateProjectController,
  getProjectController,
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
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - public
 *         - ownerId
 *       properties:
 *         id:
 *           type: integer
 *           description: 프로젝트 ID
 *         name:
 *           type: string
 *           description: 프로젝트 이름
 *         description:
 *           type: string
 *           description: 프로젝트 설명
 *         public:
 *           type: boolean
 *           description: 프로젝트 공개 여부
 *         ownerId:
 *           type: integer
 *           description: 프로젝트 소유자 ID
 *         imgId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: 연관된 이미지 ID
 *         imgUrl:
 *           type: string
 *           nullable: true
 *           description: S3 이미지 URL
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: 프로젝트 조회
 *     description: 특정 프로젝트의 상세 정보를 조회합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 */
export type GetProjectRequest = ValidatedRequest<{
  params: typeof getProjectSchema;
}>;

/**
 * @swagger
 * /api/projects/create:
 *   post:
 *     tags: [Projects]
 *     summary: 프로젝트 생성
 *     description: 새로운 프로젝트를 생성합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: 프로젝트 이름
 *               description:
 *                 type: string
 *                 description: 프로젝트 설명
 *               public:
 *                 type: boolean
 *                 description: 프로젝트 공개 여부
 *                 default: false
 *               imgId:
 *                 type: string
 *                 format: uuid
 *                 description: 이미지 ID
 *     responses:
 *       201:
 *         description: 프로젝트 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
export type CreateProjectRequest = ValidatedRequest<{
  body: typeof createProjectSchema;
}>;

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: 프로젝트 수정
 *     description: 기존 프로젝트의 정보를 수정합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 프로젝트 이름
 *               description:
 *                 type: string
 *                 description: 프로젝트 설명
 *               public:
 *                 type: boolean
 *                 description: 프로젝트 공개 여부
 *               imgId:
 *                 type: string
 *                 format: uuid
 *                 description: 이미지 ID
 *     responses:
 *       200:
 *         description: 프로젝트 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
export type UpdateProjectRequest = ValidatedRequest<{
  params: typeof getProjectSchema;
  body: Omit<typeof updateProjectSchema, 'id'>;
}>;

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: 프로젝트 삭제
 *     description: 프로젝트를 삭제합니다
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 프로젝트 ID
 *     responses:
 *       200:
 *         description: 프로젝트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedProjectId:
 *                   type: integer
 *                   description: 삭제된 프로젝트 ID
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
export type DeleteProjectRequest = ValidatedRequest<{
  params: typeof deleteProjectSchema;
}>;

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: 프로젝트 목록 조회
 *     description: 사용자가 접근 가능한 프로젝트 목록을 조회합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 프로젝트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [projects]
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         description: 인증 실패
 */
export type ListProjectsRequest = ValidatedRequest<{}>;

router.get(
  '/:id',
  authenticate,
  validate({ params: getProjectSchema }),
  getProjectController
);

router.post(
  '/create',
  authenticate,
  validate({ body: createProjectSchema }),
  createProjectController
);

router.put(
  '/update',
  authenticate,
  validate({ body: updateProjectSchema }),
  updateProjectController
);

router.delete(
  '/:id',
  authenticate,
  validate({ params: deleteProjectSchema }),
  deleteProjectController
);

router.get('/', authenticate, listProjectsController);

export { router as projectsRouter };
