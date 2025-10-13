import { TRPCError } from '@trpc/server';
import * as userService from './services';
import type {
  SignUpInput,
  LoginInput,
  ChangePasswordInput,
} from './interfaces';
import {
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
} from '@/api/lib/cookie';

export const signUpController = async ({ input }: { input: SignUpInput }) => {
  try {
    return await userService.signUp(input);
  } catch (error) {
    console.error('Error in signUpController:', error);
    throw error;
  }
};

export const loginController = async ({
  input,
  ctx,
}: {
  input: LoginInput;
  ctx: { req: any; res: any };
}) => {
  try {
    const { success, accessToken, refreshToken } = await userService.login(input);
    setAuthCookies(ctx.res, accessToken, refreshToken);
    return {
      success,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Error in loginController:', error);
    throw error;
  }
};

export const refreshController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  try {
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
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No refresh token in cookie.' });
    }

    const { success, accessToken, refreshToken: newRefreshToken } = await userService.refresh(refreshToken);
    setAuthCookies(ctx.res, accessToken, newRefreshToken);

    return {
      success,
      message: 'Token refreshed',
    };
  } catch (error) {
    console.error('Error in refreshController:', error);
    throw error;
  }
};

export const logOutController = async ({
  ctx,
}: {
  ctx: { user: { id: number }; req: any; res: any };
}) => {
  try {
    await userService.logOut(ctx.user.id);
    clearAuthCookies(ctx.res);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Error in logOutController:', error);
    throw error;
  }
};

export const changePasswordController = async ({
  input,
  ctx,
}: {
  input: ChangePasswordInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  try {
    return await userService.changePassword(input, ctx.user.id, ctx.user.role);
  } catch (error) {
    console.error('Error in changePasswordController:', error);
    throw error;
  }
};

export const verifyTokenController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  try {
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
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No access token in cookie.' });
    }
    return await userService.verifyToken(accessToken);
  } catch (error) {
    console.error('Error in verifyTokenController:', error);
    throw error;
  }
};

export const getMeController = async ({
  ctx,
}: {
  ctx: { req: any; res: any };
}) => {
  try {
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
        message: 'No refresh token provided',
      });
    }
    const { accessToken, user } = await userService.getMe(refreshToken);
    setAccessTokenCookie(ctx.res, accessToken);
    return user;
  } catch (error) {
    console.error('Error in getMeController:', error);
    throw error;
  }
};
