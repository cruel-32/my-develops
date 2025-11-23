import type { WeakRequestHandler } from 'express-zod-safe';
import jwt from 'jsonwebtoken';
import { db, users } from '@/be/db';
import { eq } from 'drizzle-orm';
import { extractTokenFromCookie } from '@/be/lib/cookie';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

export const authenticate: WeakRequestHandler = async (req, res, next) => {
  try {
    // 1. 쿠키에서 accessToken 확인
    const accessToken = extractTokenFromCookie(
      req.headers.cookie,
      'accessToken'
    );

    if (accessToken) {
      try {
        // accessToken이 유효한지 확인
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
          id: number;
          email: string;
          name: string;
        };

        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        };
        return next();
      } catch {
        // accessToken이 만료되었거나 유효하지 않은 경우
        console.log(
          'Access token invalid or expired, checking refresh token...'
        );
      }
    }

    // 2. refreshToken 확인
    const refreshToken = extractTokenFromCookie(
      req.headers.cookie,
      'refreshToken'
    );

    if (!refreshToken) {
      return res.status(401).json({ error: 'No valid tokens provided' });
    }

    try {
      // refreshToken 유효성 검사
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: number;
      };

      // DB에서 사용자와 refreshToken 확인
      const userArr = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          refresh_token: users.refresh_token,
        })
        .from(users)
        .where(eq(users.id, decoded.id));

      const user = userArr[0];

      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // 3. 새로운 accessToken 생성
      const newAccessTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const newAccessToken = jwt.sign(
        newAccessTokenPayload,
        ACCESS_TOKEN_SECRET,
        { expiresIn: 60 * 15 } // 15분
      );

      // 새로운 accessToken을 httpOnly 쿠키로 설정
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 15, // 15분
        path: '/',
      });

      // req에 user 정보 추가
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return res
        .status(401)
        .json({ error: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
