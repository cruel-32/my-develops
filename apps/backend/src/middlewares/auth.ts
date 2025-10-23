import type { WeakRequestHandler } from 'express-zod-safe';
import jwt from 'jsonwebtoken';
import { db, users } from '@/be/db';
import { eq } from 'drizzle-orm';
import { setRefreshTokenCookie, extractTokenFromCookie } from '@/be/lib/cookie';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

export const authenticate: WeakRequestHandler = async (req, res, next) => {
  try {
    // 1. Authorization 헤더에서 Bearer Token 확인
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7); // 'Bearer ' 제거

      try {
        // accessToken이 유효한지 확인
        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
          id: number;
          email: string;
        };

        // 사용자 정보 조회
        const userArr = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            is_verified: users.is_verified,
          })
          .from(users)
          .where(eq(users.id, decoded.id));

        const user = userArr[0];

        if (user) {
          // accessToken이 유효하고 사용자가 존재하면 req에 user 정보 추가
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
          };
          return next();
        }
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
      const newAccessTokenPayload = { id: user.id, email: user.email };
      const newRefreshTokenPayload = { id: user.id };

      const newAccessToken = jwt.sign(
        newAccessTokenPayload,
        ACCESS_TOKEN_SECRET,
        { expiresIn: 60 * 15 } // 15분
      );

      const newRefreshToken = jwt.sign(
        newRefreshTokenPayload,
        REFRESH_TOKEN_SECRET,
        { expiresIn: 60 * 60 * 24 * 15 } // 15일
      );

      // DB에 새로운 refreshToken 저장
      await db
        .update(users)
        .set({ refresh_token: newRefreshToken })
        .where(eq(users.id, user.id));

      // 새로운 refreshToken을 쿠키에 설정
      setRefreshTokenCookie(res, newRefreshToken);

      // 새로운 accessToken을 응답 헤더에 포함 (클라이언트가 사용할 수 있도록)
      res.setHeader('X-New-Access-Token', newAccessToken);

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
