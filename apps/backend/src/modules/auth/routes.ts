import { Router } from 'express';
import validate, { type ValidatedRequest } from 'express-zod-safe';
import { signUpSchema, loginSchema, changePasswordSchema } from './interfaces';
import {
  signUpController,
  loginController,
  refreshController,
  logOutController,
  changePasswordController,
  verifyTokenController,
} from './controllers';
import { authenticate } from '@/be/middlewares/auth';

const router: Router = Router();

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: 토큰 갱신
 *     description: 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: 인증 실패
 */
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
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
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
 *       401:
 *         description: 인증 실패
 *       400:
 *         description: 잘못된 요청
 */
export type LoginRequest = ValidatedRequest<{
  body: typeof loginSchema;
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
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
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
 *         description: 잘못된 요청 또는 이미 존재하는 이메일
 *       409:
 *         description: 이미 존재하는 사용자
 */
export type SignUpRequest = ValidatedRequest<{
  body: typeof signUpSchema;
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
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: 새로운 비밀번호
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       401:
 *         description: 인증 실패
 *       400:
 *         description: 잘못된 요청
 */
export type ChangePasswordRequest = ValidatedRequest<{
  body: typeof changePasswordSchema;
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
 *               properties:
 *                 valid:
 *                   type: boolean
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
 *         description: 토큰이 유효하지 않음
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
 *       401:
 *         description: 인증 실패
 */

router.post('/refresh', refreshController);
router.post('/verify-token', verifyTokenController);
router.post('/logout', authenticate, logOutController);

router.post('/login', validate({ body: loginSchema }), loginController);
router.post('/signup', validate({ body: signUpSchema }), signUpController);
router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  changePasswordController
);

export { router as authRouter };
