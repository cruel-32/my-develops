import { ZodError } from 'zod';
import { formatValidationErrors } from '@/be/lib/errorFormatter';

/**
 * express-zod-safe의 validate 미들웨어를 위한 커스텀 에러 핸들러
 * 검증 실패 시 통일된 형식의 응답을 반환합니다
 */
export const validateErrorHandler = (
  errors: Array<{ type: string; errors: ZodError }>,
  _req: any,
  res: any,
  _next: any
) => {
  const formattedError = formatValidationErrors(errors);
  res.status(formattedError.statusCode).json(formattedError);
};
