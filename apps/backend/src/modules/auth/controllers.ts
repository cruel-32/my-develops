import { Request, Response } from 'express';
import * as authService from './services';
import type {
  SignUpRequest,
  LoginRequest,
  ChangePasswordRequest,
} from './routes';
import { setRefreshTokenCookie, clearAuthCookies } from '@/be/lib/cookie';

export const signUpController = async (req: SignUpRequest, res: Response) => {
  const result = await authService.signUp(req.body);
  res.json(result);
};

export const loginController = async (req: LoginRequest, res: Response) => {
  const { success, accessToken, refreshToken } = await authService.login(
    req.body
  );

  // refreshToken만 cookie에 설정
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success,
    accessToken, // 클라이언트가 헤더에 사용할 수 있도록
    message: 'Login successful',
  });
};

export const refreshController = async (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie;
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
    console.log('refreshToken', refreshToken);
  }
  if (!refreshToken) {
    return res.status(401).json({
      error: 'No refresh token in cookie.',
    });
  }

  const {
    success,
    accessToken,
    refreshToken: newRefreshToken,
  } = await authService.refresh(refreshToken);

  // 새로운 refreshToken을 cookie에 설정
  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success,
    accessToken, // 클라이언트가 헤더에 사용할 수 있도록
    message: 'Token refreshed',
  });
};

export const logOutController = async (req: Request, res: Response) => {
  await authService.logOut(req.user!.id);
  clearAuthCookies(res);
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const changePasswordController = async (
  req: ChangePasswordRequest,
  res: Response
) => {
  const result = await authService.changePassword(req.body, req.user!.id);
  res.json(result);
};

export const verifyTokenController = async (req: Request, res: Response) => {
  // Authorization 헤더에서 Bearer Token 추출
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No access token provided in Authorization header.',
    });
  }

  const accessToken = authHeader.substring(7); // 'Bearer ' 제거

  if (!accessToken) {
    return res.status(401).json({
      error: 'No access token provided.',
    });
  }

  const result = await authService.verifyToken(accessToken);
  res.json(result);
};
