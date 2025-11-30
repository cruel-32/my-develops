import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  postApiProjectsCreateMutationRequestSchema,
  deleteApiProjectsIdPathParamsSchema,
  putApiProjectsIdMutationRequestSchema,
  getApiProjectsIdPathParamsSchema,
} from '@repo/api/zod';
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
 *               $ref: "#/components/schemas/Project"
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 */
export type GetProjectRequest = ValidatedRequest<{
  params: typeof getApiProjectsIdPathParamsSchema;
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
 *               $ref: "#/components/schemas/Project"
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
export type CreateProjectRequest = ValidatedRequest<{
  body: typeof postApiProjectsCreateMutationRequestSchema;
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
 *               $ref: "#/components/schemas/Project"
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 */
export type UpdateProjectRequest = ValidatedRequest<{
  params: typeof getApiProjectsIdPathParamsSchema;
  body: typeof putApiProjectsIdMutationRequestSchema;
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
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 프로젝트를 찾을 수 없음
 */
export type DeleteProjectRequest = ValidatedRequest<{
  params: typeof deleteApiProjectsIdPathParamsSchema;
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
 *                     $ref: "#/components/schemas/Project"
 *       401:
 *         description: 인증 실패
 */
export type ListProjectsRequest = ValidatedRequest<{}>;

router.get(
  '/:id',
  authenticate,
  validate({ params: getApiProjectsIdPathParamsSchema }),
  getProjectController
);

router.post(
  '/create',
  authenticate,
  validate({ body: postApiProjectsCreateMutationRequestSchema }),
  createProjectController
);

router.put(
  '/:id',
  authenticate,
  validate({
    params: getApiProjectsIdPathParamsSchema,
    body: putApiProjectsIdMutationRequestSchema,
  }),
  updateProjectController
);

router.delete(
  '/:id',
  authenticate,
  validate({ params: deleteApiProjectsIdPathParamsSchema }),
  deleteProjectController
);

router.get('/', authenticate, listProjectsController);

export { router as projectsRouter };
