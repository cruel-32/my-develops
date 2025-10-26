import { Request, Response } from 'express';
import * as userService from './services';
// import { setRefreshTokenCookie } from '@/be/lib/cookie'; // 사용하지 않음
import type {
  GetUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
} from './routes';
import { AuthenticationError } from '@/be/lib/errors';

// Users 모듈은 이제 사용자 관리 관련 기능만 담당
// 인증 관련 기능은 auth 모듈로 이동됨

export const getMeController = async (req: Request, res: Response) => {
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
  }
  if (!refreshToken) {
    throw new AuthenticationError('No refresh token provided');
  }
  const result = await userService.getMe(refreshToken);
  res.json(result);
};

export const getUserController = async (req: GetUserRequest, res: Response) => {
  const result = await userService.getUser({ id: req.params.id });
  res.json(result);
};

export const updateUserController = async (
  req: UpdateUserRequest,
  res: Response
) => {
  const result = await userService.updateUser({
    ...req.body,
    id: req.params.id,
  });
  res.json(result);
};

export const deleteUserController = async (
  req: DeleteUserRequest,
  res: Response
) => {
  const result = await userService.deleteUser(req.params);
  res.json(result);
};

export const listUsersController = async (req: Request, res: Response) => {
  const result = await userService.listUsers();
  res.json(result);
};
