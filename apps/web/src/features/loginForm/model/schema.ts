import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, '이메일은 필수입니다')
    .email('유효하지 않은 이메일 형식입니다'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

/**
 * Login form data type
 */
export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Login form default values
 */
export const loginFormDefaultValues: LoginFormData = {
  email: '',
  password: '',
};
