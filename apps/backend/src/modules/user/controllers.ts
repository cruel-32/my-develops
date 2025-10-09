import * as userService from './services';
import type {
  SignUpInput,
  LogInInput,
  ChangePasswordInput,
} from './interfaces';
import {
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
} from '@/lib/cookie';

export const signUpController = async ({ input }: { input: SignUpInput }) => {
  return await userService.signUp(input);
};

export const logInController = async ({
  input,
  ctx,
}: {
  input: LogInInput;
  ctx: { req: any; res: any };
}) => {
  // Get tokens from service
  const { accessToken, refreshToken } = await userService.logIn(input);

  // ✅ Set tokens in HttpOnly cookies
  setAuthCookies(ctx.res, accessToken, refreshToken);

  // ✅ Return success without exposing tokens
  return {
    success: true,
    message: 'Login successful',
  };
};

export const refreshController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  // ✅ Extract refreshToken from cookie
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
    throw new Error('No refresh token provided');
  }

  // Get new tokens from service
  const { accessToken } = await userService.refresh(refreshToken);

  // ✅ Set new access token in cookie
  setAccessTokenCookie(ctx.res, accessToken);

  return {
    success: true,
    message: 'Token refreshed',
  };
};

// protectedProcedure는 context에 user 객체를 주입해줍니다.
export const logOutController = async ({
  ctx,
}: {
  ctx: { user: { id: number }; req: any; res: any };
}) => {
  // Clear tokens in database
  await userService.logOut(ctx.user.id);

  // ✅ Clear cookies
  clearAuthCookies(ctx.res);

  return {
    success: true,
    message: 'Logged out successfully',
  };
};

export const changePasswordController = async ({
  input,
  ctx,
}: {
  input: ChangePasswordInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  return await userService.changePassword(input, ctx.user.id, ctx.user.role);
};

export const verifyTokenController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  // ✅ Cookie에서 accessToken 추출
  const cookieHeader = ctx.req.headers.cookie;
  let accessToken: string | undefined;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );
    accessToken = cookies['accessToken'];
  }

  if (!accessToken) {
    throw new Error('No access token provided');
  }

  return await userService.verifyToken(accessToken);
};
