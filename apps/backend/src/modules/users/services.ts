import { db, users } from '@/be/db';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import {
  NotFoundError,
  ValidationError,
  InternalServerError,
  AuthenticationError,
} from '@/be/lib/errors';
import type {
  GetUserInput,
  UpdateUserInput,
  DeleteUserInput,
} from './interfaces';

// Users 모듈은 이제 사용자 관리 관련 기능만 담당
// 인증 관련 기능은 auth 모듈로 이동됨

export const getUser = async (input: GetUserInput) => {
  const userArr = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      is_verified: users.is_verified,
      picture: users.picture,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, input.id));

  const user = userArr[0];
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return {
    user,
  };
};

export const updateUser = async (input: UpdateUserInput) => {
  const updateData: any = {};

  if (input.name) updateData.name = input.name;
  if (input.picture) updateData.picture = input.picture;

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No fields to update.');
  }

  updateData.updatedAt = new Date();

  const updatedUserArr = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, input.id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      is_verified: users.is_verified,
      picture: users.picture,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  const updatedUser = updatedUserArr[0];
  if (!updatedUser) {
    throw new InternalServerError('User not found or update failed.');
  }

  return {
    user: updatedUser,
  };
};

export const deleteUser = async (input: DeleteUserInput) => {
  const deletedUserArr = await db
    .delete(users)
    .where(eq(users.id, input.id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  const deletedUser = deletedUserArr[0];
  if (!deletedUser) {
    throw new InternalServerError('User not found or deletion failed.');
  }

  return { deletedUserId: input.id };
};

export const getMe = async (refreshToken: string) => {
  const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
  const ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET || 'access-secret';

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      id: number;
    };

    const userArr = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        is_verified: users.is_verified,
        picture: users.picture,
        refresh_token: users.refresh_token,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    const user = userArr[0];

    if (!user || user.refresh_token !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token.');
    }

    if (!user.email || !user.name) {
      throw new ValidationError('User data is incomplete.');
    }

    const newAccessTokenPayload = { id: user.id, email: user.email };
    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: 60 * 15, // 15분
      }
    );

    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid or expired token.');
    }

    throw error;
  }
};

export const listUsers = async () => {
  const usersList = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      is_verified: users.is_verified,
      picture: users.picture,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);

  return {
    users: usersList,
  };
};
