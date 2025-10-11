import { TRPCError } from '@trpc/server';
import { db, users } from '@repo/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type {
  SignUpInput,
  LogInInput,
  ChangePasswordInput,
} from './interfaces';

// 환경 변수에서 시크릿 키와 유효 기간을 가져옵니다.
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

export const signUp = async (input: SignUpInput) => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));
  if (existingUser.length > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User with this email already exists.',
    });
  }

  const password_hash = await bcrypt.hash(input.password, 10);

  const newUserArr = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      password_hash,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  const newUser = newUserArr[0];
  if (!newUser) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create user.',
    });
  }
  return newUser;
};

export const logIn = async (input: LogInInput) => {
  const userArr = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));
  const user = userArr[0];

  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
  }

  if (!user.password_hash || !user.email) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'User data is incomplete.',
    });
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.password_hash
  );
  if (!isPasswordValid) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password.' });
  }

  const accessTokenPayload = { id: user.id, email: user.email };
  const refreshTokenPayload = { id: user.id };

  // Access Token과 Refresh Token 생성 (expiresIn을 초 단위 숫자로 변경)
  const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, {
    expiresIn: 60 * 15, // 15분
  });
  const refreshToken = jwt.sign(refreshTokenPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: 60 * 60 * 24 * 15, // 15일
  });

  await db
    .update(users)
    .set({ refresh_token: refreshToken })
    .where(eq(users.id, user.id));

  return { accessToken, refreshToken };
};

export const refresh = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      id: number;
    };
    const userArr = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    const user = userArr[0];

    if (!user || user.refresh_token !== refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token.',
      });
    }

    if (!user.email) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User data is incomplete.',
      });
    }

    const newAccessTokenPayload = { id: user.id, email: user.email };
    const newRefreshTokenPayload = { id: user.id };

    // 새로운 토큰 쌍 발급 (expiresIn을 초 단위 숫자로 변경)
    const newAccessToken = jwt.sign(
      newAccessTokenPayload,
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: 900, // 15분
      }
    );
    const newRefreshToken = jwt.sign(
      newRefreshTokenPayload,
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: 1296000, // 15일
      }
    );

    await db
      .update(users)
      .set({ refresh_token: newRefreshToken })
      .where(eq(users.id, user.id));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid refresh token.',
    });
  }
};

export const logOut = async (userId: number) => {
  await db
    .update(users)
    .set({ refresh_token: null })
    .where(eq(users.id, userId));
  return { success: true };
};

export const changePassword = async (
  input: ChangePasswordInput,
  currentUserId: number,
  currentUserRole?: string
) => {
  // 권한 체크: 현재 사용자 본인이거나 super_admin인 경우만 수정 가능
  if (input.userId !== currentUserId && currentUserRole !== 'super_admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: "You do not have permission to change this user's password.",
    });
  }

  // 대상 사용자 조회
  const targetUserArr = await db
    .select()
    .from(users)
    .where(eq(users.id, input.userId));
  const targetUser = targetUserArr[0];

  if (!targetUser) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found.',
    });
  }

  // 현재 비밀번호 검증 (본인인 경우에만)
  if (input.userId === currentUserId) {
    if (!targetUser.password_hash) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User password data is incomplete.',
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      targetUser.password_hash
    );
    if (!isCurrentPasswordValid) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect.',
      });
    }
  }

  // 새 비밀번호 해시화
  const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

  // 비밀번호 업데이트
  await db
    .update(users)
    .set({
      password_hash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, input.userId));

  return { success: true, message: 'Password changed successfully.' };
};

export const verifyToken = async (accessToken: string) => {
  try {
    const ACCESS_TOKEN_SECRET =
      process.env.ACCESS_TOKEN_SECRET || 'access-secret';
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
      id: number;
      email: string;
    };

    // 사용자 존재 여부 확인
    const userArr = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    const user = userArr[0];

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token.',
      });
    }

    // TRPCError는 그대로 던지기
    if (error instanceof TRPCError) {
      throw error;
    }

    // 기타 오류
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Token verification failed.',
    });
  }
};
