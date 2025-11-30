import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import {
  postApiAuthSignupMutationRequestSchema,
  postApiAuthLoginMutationRequestSchema,
  postApiAuthChangePasswordMutationRequestSchema,
} from '@repo/api/zod';
import {
  signUpController,
  loginController,
  logOutController,
  changePasswordController,
  verifyTokenController,
} from './controllers';
import { authenticate } from '@/be/middlewares';

const router: Router = Router();

export type RefreshRequest = ValidatedRequest<{}>;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: 사용자 비밀번호 (최소 8자)
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [accessToken, message]
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
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
 *                   example: 'User data is incomplete.'
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: 인증 실패 (비밀번호 불일치)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid password.'
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       404:
 *         description: 사용자 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User not found.'
 *                 statusCode:
 *                   type: number
 *                   example: 404
 */
export type LoginRequest = ValidatedRequest<{
  body: typeof postApiAuthLoginMutationRequestSchema;
}>;

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [accessToken, message]
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       409:
 *         description: 이미 존재하는 이메일
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User with this email already exists.'
 *                 statusCode:
 *                   type: number
 *                   example: 409
 *       500:
 *         description: 사용자 생성 실패 (서버 오류)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Failed to create user.'
 *                 statusCode:
 *                   type: number
 *                   example: 500
 */
export type SignUpRequest = ValidatedRequest<{
  body: typeof postApiAuthSignupMutationRequestSchema;
}>;

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: 비밀번호 변경
 *     description: 현재 사용자의 비밀번호를 변경합니다
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, currentPassword, newPassword]
 *             properties:
 *               userId:
 *                 type: number
 *                 description: 대상 사용자 ID
 *               currentPassword:
 *                 type: string
 *                 description: 현재 비밀번호
 *               newPassword:
 *                 type: string
 *                 description: 새로운 비밀번호
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 사용자 비밀번호 데이터 검증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User password data is incomplete.'
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: 현재 비밀번호 불일치
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Current password is incorrect.'
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Permission denied.'
 *                 statusCode:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: 사용자 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User not found.'
 *                 statusCode:
 *                   type: number
 *                   example: 404
 */
export type ChangePasswordRequest = ValidatedRequest<{
  body: typeof postApiAuthChangePasswordMutationRequestSchema;
}>;

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     tags: [Authentication]
 *     summary: 토큰 검증
 *     description: 액세스 토큰의 유효성을 검증합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰이 유효함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [user]
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: 토큰이 유효하지 않음 또는 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid or expired token.'
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       404:
 *         description: 사용자 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'User not found.'
 *                 statusCode:
 *                   type: number
 *                   example: 404
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: 로그아웃
 *     description: 현재 사용자를 로그아웃 처리합니다
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: 토큰이 없음 또는 유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'No valid tokens provided'
 *                 statusCode:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [error, statusCode]
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal server error'
 *                 statusCode:
 *                   type: number
 *                   example: 500
 */

router.post('/verify-token', verifyTokenController);
router.post('/logout', authenticate, logOutController);

router.post(
  '/login',
  validate({ body: postApiAuthLoginMutationRequestSchema }),
  loginController
);
router.post(
  '/signup',
  validate({ body: postApiAuthSignupMutationRequestSchema }),
  signUpController
);
router.post(
  '/change-password',
  authenticate,
  validate({ body: postApiAuthChangePasswordMutationRequestSchema }),
  changePasswordController
);

export { router as authRouter };
