import type { Response } from 'express';

// Cookie options configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60, // 15 minutes in seconds
};

const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Clear authentication cookies (for logout)
 *
 * @param res - HTTP Response object
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', { path: COOKIE_OPTIONS.path });
  res.clearCookie('refreshToken', { path: COOKIE_OPTIONS.path });
}

// Extract token from cookie header
export function extractTokenFromCookie(
  cookieHeader: string | undefined,
  tokenName: string
): string | undefined {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';').reduce(
    (acc: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies[tokenName];
}

export { ACCESS_TOKEN_OPTIONS, REFRESH_TOKEN_OPTIONS, COOKIE_OPTIONS };

