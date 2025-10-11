import { publicProcedure, protectedProcedure, router } from '@/api/trpc';
import { signUpSchema, logInSchema, changePasswordSchema } from './interfaces';
import {
  signUpController,
  logInController,
  refreshController,
  logOutController,
  changePasswordController,
  verifyTokenController,
} from './controllers';

export const userRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(signUpController),
  logIn: publicProcedure.input(logInSchema).mutation(logInController),
  // ✅ refresh는 더 이상 input이 필요 없음 (Cookie에서 refreshToken 추출)
  refresh: publicProcedure.mutation(refreshController),
  // ✅ 토큰 검증 전용 엔드포인트 (미들웨어용)
  verifyToken: publicProcedure.mutation(verifyTokenController),
  // logOut은 인증된 사용자만 접근 가능
  logOut: protectedProcedure.mutation(logOutController),
  // changePassword는 인증된 사용자만 접근 가능
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(changePasswordController),
});
