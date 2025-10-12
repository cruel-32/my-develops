import { initTRPC, TRPCError } from '@trpc/server';
import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import jwt from 'jsonwebtoken';
import * as userService from '@/api/modules/users/services';
import { setAuthCookies } from '@/api/lib/cookie';

// 환경 변수에서 시크릿 키를 가져옵니다.
const ACCESS_TOKEN_SECRET =
  (process as any).env?.ACCESS_TOKEN_SECRET || 'access-secret';

// JWT payload 타입을 정의합니다.
export type UserPayload = {
  id: number;
  email: string;
};

// --- Context Creation ---
// HTTP 요청에서 헤더, 쿠키를 받아 context를 생성합니다.
// res 객체도 포함하여 Cookie 설정 가능하도록 합니다.
export const createContext = async (opts: CreateHTTPContextOptions) => {
  const authorization = opts.req.headers.authorization;
  return {
    req: opts.req,
    res: opts.res,
    authorization,
  };
};

const t = initTRPC.context<typeof createContext>().create();

// --- Auto Refresh Function ---
async function attemptTokenRefresh(ctx: {
  req: any;
  res: any;
}): Promise<UserPayload> {
  // refreshToken 추출
  const cookieHeader = ctx.req.headers.cookie;
  let refreshToken: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    refreshToken = cookies['refreshToken'];
  }

  if (!refreshToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No refresh token available',
    });
  }

  try {
    // refreshToken으로 새 accessToken 발급
    const { accessToken, refreshToken: newRefreshToken } =
      await userService.refresh(refreshToken);

    // 새 accessToken과 refreshToken을 쿠키에 설정
    setAuthCookies(ctx.res, accessToken, newRefreshToken);

    // 새 토큰으로 사용자 정보 추출
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as UserPayload;

    return decoded;
  } catch {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Token refresh failed',
    });
  }
}

// --- Auth Middleware ---
const isAuthed = t.middleware(async ({ ctx, next }) => {
  // ✅ Cookie에서 accessToken 추출 시도 (우선순위 1)
  const cookieHeader = ctx.req.headers.cookie;
  let token: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    token = cookies['accessToken'];
  }

  // ✅ Cookie에 없으면 Authorization 헤더에서 추출 (우선순위 2)
  if (!token && ctx.authorization) {
    token = ctx.authorization.split(' ')[1];
  }

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No access token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // context에 user 정보를 추가하여 다음 프로시저에서 사용
    return next({
      ctx: {
        ...ctx,
        user: decoded as UserPayload,
      },
    });
  } catch (err) {
    // 토큰 검증 실패 시 자동 갱신 시도
    if (err instanceof jwt.JsonWebTokenError) {
      try {
        // 토큰 갱신 시도
        const decoded = await attemptTokenRefresh(ctx);

        // 갱신된 토큰으로 원래 요청 재실행
        return next({
          ctx: {
            ...ctx,
            user: decoded,
          },
        });
      } catch {
        // 토큰 갱신도 실패한 경우
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Token expired and refresh failed',
        });
      }
    }
    // JWT 관련이 아닌 다른 오류
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
// 인증이 필요한 프로시저를 위해 export
export const protectedProcedure = t.procedure.use(isAuthed);
