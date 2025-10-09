import { initTRPC, TRPCError } from '@trpc/server';
import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import jwt from 'jsonwebtoken';

// JWT payload 타입을 정의합니다.
interface UserPayload {
  id: number;
  email: string;
}

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

// --- Auth Middleware ---
const isAuthed = t.middleware(({ ctx, next }) => {
  // ✅ Cookie에서 accessToken 추출 시도 (우선순위 1)
  const cookieHeader = ctx.req.headers.cookie;
  let token: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
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
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'access-secret'
    );
    // context에 user 정보를 추가하여 다음 프로시저에서 사용
    return next({
      ctx: {
        ...ctx,
        user: decoded as UserPayload,
      },
    });
  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
// 인증이 필요한 프로시저를 위해 export
export const protectedProcedure = t.procedure.use(isAuthed);
