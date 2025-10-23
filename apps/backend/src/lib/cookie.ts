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

// Serialize cookie options to Set-Cookie header format
export function serializeCookie(
  options: typeof COOKIE_OPTIONS & { maxAge?: number }
): string {
  const parts: string[] = [];

  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);

  return parts.join('; ');
}

// Set authentication cookies in HTTP response (refreshToken only)
export function setAuthCookies(
  response: any,
  accessToken: string,
  refreshToken: string
): { accessToken: string } {
  // refreshToken만 cookie에 설정
  response.setHeader('Set-Cookie', [
    `refreshToken=${refreshToken}; ${serializeCookie(REFRESH_TOKEN_OPTIONS)}`,
  ]);

  // accessToken은 응답에 포함하여 반환
  return { accessToken };
}

/**
 * Clear authentication cookies (for logout)
 *
 * @param response - HTTP Response object (from tRPC context)
 */
export function clearAuthCookies(response: any): void {
  response.setHeader('Set-Cookie', ['refreshToken=; Path=/; Max-Age=0']);
}

/**
 * Set only refresh token cookie (for refresh operation)
 *
 * @param response - HTTP Response object
 * @param refreshToken - New JWT refresh token
 */
export function setRefreshTokenCookie(
  response: any,
  refreshToken: string
): void {
  response.setHeader(
    'Set-Cookie',
    `refreshToken=${refreshToken}; ${serializeCookie(REFRESH_TOKEN_OPTIONS)}`
  );
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
