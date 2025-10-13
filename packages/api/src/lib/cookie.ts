/**
 * Cookie configuration and utilities for HttpOnly cookie authentication
 */

/**
 * Base cookie options for all authentication cookies
 */
export const COOKIE_OPTIONS = {
  httpOnly: true, // Prevent XSS attacks - JavaScript cannot access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection - allows same-site requests
  path: '/', // Available for all routes
};

/**
 * Access token cookie options (short-lived)
 */
export const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60, // 15 minutes in seconds
};

/**
 * Refresh token cookie options (long-lived)
 */
export const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Serialize cookie options to Set-Cookie header format
 */
function serializeCookie(
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

/**
 * Set authentication cookies in HTTP response
 *
 * @param response - HTTP Response object (from tRPC context)
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export function setAuthCookies(
  response: any, // HTTP Response object
  accessToken: string,
  refreshToken: string
): void {
  response.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; ${serializeCookie(ACCESS_TOKEN_OPTIONS)}`,
    `refreshToken=${refreshToken}; ${serializeCookie(REFRESH_TOKEN_OPTIONS)}`,
  ]);
}

/**
 * Clear authentication cookies (for logout)
 *
 * @param response - HTTP Response object (from tRPC context)
 */
export function clearAuthCookies(response: any): void {
  response.setHeader('Set-Cookie', [
    'accessToken=; Path=/; Max-Age=0',
    'refreshToken=; Path=/; Max-Age=0',
  ]);
}

/**
 * Set only access token cookie (for refresh operation)
 *
 * @param response - HTTP Response object
 * @param accessToken - New JWT access token
 */
export function setAccessTokenCookie(response: any, accessToken: string): void {
  response.setHeader(
    'Set-Cookie',
    `accessToken=${accessToken}; ${serializeCookie(ACCESS_TOKEN_OPTIONS)}`
  );
}
