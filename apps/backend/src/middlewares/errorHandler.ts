import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/be/lib/errors';
import {
  formatAppError,
  formatError,
  FormattedErrorResponse,
} from '@/be/lib/errorFormatter';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let formattedError: FormattedErrorResponse;

  // AppError 인스턴스인 경우
  if (error instanceof AppError) {
    formattedError = formatAppError(error);
  }
  // JWT 관련 에러
  else if (error.name === 'JsonWebTokenError') {
    formattedError = formatError('Invalid token', 401);
  } else if (error.name === 'TokenExpiredError') {
    formattedError = formatError('Token expired', 401);
  }
  // 기타 에러는 500으로 처리
  else {
    console.error('Unhandled error:', error);
    formattedError = formatError(
      error.message || 'Internal server error',
      500
    );
  }

  return res.status(formattedError.statusCode).json(formattedError);
};
