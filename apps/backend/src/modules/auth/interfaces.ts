import { z } from 'zod';

// ========== Request Schemas ==========

export const signUpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  confirmPassword: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  userId: z.number(),
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

// ========== Response Schemas ==========

export const authSuccessSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  message: z.string().optional(),
  user: z
    .object({
      id: z.number(),
      email: z.string(),
      name: z.string(),
    })
    .optional(),
});

export const authErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const tokenVerifyResponseSchema = z.object({
  valid: z.boolean(),
  user: z
    .object({
      id: z.number(),
      email: z.string(),
      name: z.string(),
    })
    .optional(),
});

// ========== Input Types ==========

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ========== Response Types ==========

export type AuthSuccessResponse = z.infer<typeof authSuccessSchema>;
export type AuthErrorResponse = z.infer<typeof authErrorSchema>;
export type TokenVerifyResponse = z.infer<typeof tokenVerifyResponseSchema>;
