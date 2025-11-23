import { Request, Response } from 'express';
import * as authService from './services';
import type {
  SignUpRequest,
  LoginRequest,
  ChangePasswordRequest,
} from './routes';
import {
  clearAuthCookies,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '@/be/lib/cookie';
import { AuthenticationError } from '@/be/lib/errors';

export const signUpController = async (req: SignUpRequest, res: Response) => {
  const result = await authService.signUp(req.body);

  res.cookie('accessToken', result.accessToken, {
    ...ACCESS_TOKEN_OPTIONS,
    maxAge: ACCESS_TOKEN_OPTIONS.maxAge * 1000,
  });
  res.cookie('refreshToken', result.refreshToken, {
    ...REFRESH_TOKEN_OPTIONS,
    maxAge: REFRESH_TOKEN_OPTIONS.maxAge * 1000,
  });

  res.status(201).json({
    user: result.user,
    message: result.message,
  });
};

export const loginController = async (req: LoginRequest, res: Response) => {
  const { accessToken, refreshToken } = await authService.login(req.body);

  res.cookie('accessToken', accessToken, {
    ...ACCESS_TOKEN_OPTIONS,
    maxAge: ACCESS_TOKEN_OPTIONS.maxAge * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...REFRESH_TOKEN_OPTIONS,
    maxAge: REFRESH_TOKEN_OPTIONS.maxAge * 1000,
  });

  res.json({
    message: 'Logged in successfully',
  });
};

export const logOutController = async (req: Request, res: Response) => {
  const result = await authService.logOut(req.user!.id);
  clearAuthCookies(res);
  res.json(result);
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
    throw new AuthenticationError(
      'No access token provided in Authorization header.'
    );
  }

  const accessToken = authHeader.substring(7); // 'Bearer ' 제거

  if (!accessToken) {
    throw new AuthenticationError('No access token provided.');
  }

  const result = await authService.verifyToken(accessToken);
  res.json(result);
};
