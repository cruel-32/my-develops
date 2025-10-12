import { publicProcedure, protectedProcedure, router } from '@/api/trpc';
import { signUpSchema, loginSchema, changePasswordSchema } from './interfaces';
import {
  signUpController,
  loginController,
  refreshController,
  logOutController,
  changePasswordController,
  verifyTokenController,
  getMeController,
} from './controllers';

export const usersRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(signUpController),
  login: publicProcedure.input(loginSchema).mutation(loginController),
  // ✅ refresh는 더 이상 input이 필요 없음 (Cookie에서 refreshToken 추출)
  refresh: publicProcedure.mutation(refreshController),
  // ✅ 토큰 검증 전용 엔드포인트 (미들웨어용)
  verifyToken: publicProcedure.mutation(verifyTokenController),
  getMe: publicProcedure.query(getMeController),
  // logOut은 인증된 사용자만 접근 가능
  logOut: protectedProcedure.mutation(logOutController),
  // changePassword는 인증된 사용자만 접근 가능
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(changePasswordController),
});
