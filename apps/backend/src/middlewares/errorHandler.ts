import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/be/lib/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // AppError 인스턴스인 경우
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    });
  }

  // JWT 관련 에러
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401,
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      statusCode: 401,
    });
  }

  // 기타 에러는 500으로 처리
  console.error('Unhandled error:', error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    statusCode: 500,
  });
};
