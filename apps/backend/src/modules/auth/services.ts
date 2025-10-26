import { db, users, operatorRoles, roles } from '@/be/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  InternalServerError,
  AuthorizationError,
} from '@/be/lib/errors';
import type {
  SignUpInput,
  LoginInput,
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
    throw new ConflictError('User with this email already exists.');
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
    throw new InternalServerError('Failed to create user.');
  }

  // Access Token과 Refresh Token 생성
  const accessTokenPayload = { id: newUser.id, email: newUser.email };
  const refreshTokenPayload = { id: newUser.id };

  const accessToken = jwt.sign(accessTokenPayload, ACCESS_TOKEN_SECRET, {
    expiresIn: 60 * 15, // 15분
  });
  const refreshToken = jwt.sign(refreshTokenPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: 60 * 60 * 24 * 15, // 15일
  });

  // refresh_token을 데이터베이스에 저장
  await db
    .update(users)
    .set({ refresh_token: refreshToken })
    .where(eq(users.id, newUser.id));

  return {
    user: newUser,
    accessToken,
    refreshToken,
    message: '회원가입되었습니다',
  };
};

export const login = async (input: LoginInput) => {
  const userArr = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));
  const user = userArr[0];

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  if (!user.password_hash || !user.email) {
    throw new ValidationError('User data is incomplete.');
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.password_hash
  );
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid password.');
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

export const logOut = async (userId: number) => {
  await db
    .update(users)
    .set({ refresh_token: null })
    .where(eq(users.id, userId));
  return { success: true };
};

export const changePassword = async (
  input: ChangePasswordInput,
  currentUserId: number
) => {
  // 권한 체크: 현재 사용자 본인이거나 super_admin인 경우만 수정 가능

  const operatorRolesArr = await db
    .select({
      roleName: roles.roleName,
    })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, currentUserId))
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  const operatorRoleNames = operatorRolesArr.map(
    (role) => role.roleName || 'user'
  );

  if (
    input.userId !== currentUserId &&
    !operatorRoleNames.includes('super_admin')
  ) {
    throw new AuthorizationError('Permission denied.');
  }

  // 대상 사용자 조회
  const targetUserArr = await db
    .select()
    .from(users)
    .where(eq(users.id, input.userId));
  const targetUser = targetUserArr[0];

  if (!targetUser) {
    throw new NotFoundError('User not found.');
  }

  // 현재 비밀번호 검증 (본인인 경우에만)
  if (input.userId === currentUserId) {
    if (!targetUser.password_hash) {
      throw new ValidationError('User password data is incomplete.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      targetUser.password_hash
    );
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect.');
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

  return { message: 'Password changed successfully.' };
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
      throw new NotFoundError('User not found.');
    }

    return {
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
