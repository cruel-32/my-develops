import { ZodError } from 'zod';

/**
 * 통일된 API 에러 응답 형식
 */
export interface FormattedErrorResponse {
  error: string;
  statusCode: number;
  details?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Zod 검증 에러를 통일된 형식으로 변환
 * @param zodError Zod의 ZodError
 * @returns FormattedErrorResponse
 */
export const formatZodError = (zodError: ZodError): FormattedErrorResponse => {
  const details = zodError.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));

  return {
    error: 'Validation failed',
    statusCode: 400,
    details,
  };
};

/**
 * express-zod-safe의 에러 배열을 통일된 형식으로 변환
 * @param errors express-zod-safe 에러 배열
 * @returns FormattedErrorResponse
 */
export const formatValidationErrors = (
  errors: Array<{ type: string; errors: ZodError }>
): FormattedErrorResponse => {
  const details: Array<{
    field?: string;
    message: string;
    code?: string;
  }> = [];

  errors.forEach(({ type, errors: zodError }) => {
    zodError.issues.forEach((issue) => {
      const field =
        type === 'body'
          ? issue.path.join('.')
          : `${type}.${issue.path.join('.')}`;

      details.push({
        field: field || type,
        message: issue.message,
        code: issue.code,
      });
    });
  });

  return {
    error: 'Validation failed',
    statusCode: 400,
    details,
  };
};

/**
 * 일반 에러를 통일된 형식으로 변환
 * @param error 에러 메시지 또는 에러 객체
 * @param statusCode HTTP 상태 코드
 * @param details 추가 상세 정보
 * @returns FormattedErrorResponse
 */
export const formatError = (
  error: string | Error,
  statusCode: number = 500,
  details?: Array<{ field?: string; message: string; code?: string }>
): FormattedErrorResponse => {
  const errorMessage =
    typeof error === 'string' ? error : error.message || 'Unknown error';

  return {
    error: errorMessage,
    statusCode,
    ...(details && details.length > 0 && { details }),
  };
};

/**
 * AppError 인스턴스를 통일된 형식으로 변환
 * @param error AppError 인스턴스
 * @returns FormattedErrorResponse
 */
export const formatAppError = (
  error: Error & { statusCode?: number }
): FormattedErrorResponse => {
  return {
    error: error.message || 'Internal server error',
    statusCode: error.statusCode || 500,
  };
};

/**
 * 커스텀 필드 에러를 추가하여 통일된 형식으로 반환
 * @param error 기본 에러 메시지
 * @param statusCode HTTP 상태 코드
 * @param fieldErrors 필드별 에러 정보
 * @returns FormattedErrorResponse
 */
export const formatErrorWithDetails = (
  error: string,
  statusCode: number,
  fieldErrors?: Record<string, string>
): FormattedErrorResponse => {
  const details = fieldErrors
    ? Object.entries(fieldErrors).map(([field, message]) => ({
        field,
        message,
      }))
    : undefined;

  return {
    error,
    statusCode,
    ...(details && { details }),
  };
};
