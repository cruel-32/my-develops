import { setGlobalErrorHandler } from 'express-zod-safe';
import { formatValidationErrors } from '@/be/lib/errorFormatter';

setGlobalErrorHandler((errors, req, res) => {
  // Your error handling here
  const formattedError = formatValidationErrors(errors);
  res.status(formattedError.statusCode).json(formattedError);
});
