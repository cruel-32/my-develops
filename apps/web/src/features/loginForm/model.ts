import { z } from 'zod';
import { postApiAuthLoginMutationRequestSchema } from '@/web/shared/model';

export const loginFormSchema = postApiAuthLoginMutationRequestSchema;

/**
 * Login form data type
 */
export type LoginFormData = z.infer<
  typeof postApiAuthLoginMutationRequestSchema
>;

/**
 * Login form default values
 */
export const loginFormDefaultValues: LoginFormData = {
  email: '',
  password: '',
};
