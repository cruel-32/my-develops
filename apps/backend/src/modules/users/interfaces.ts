import { z } from 'zod';

// Users 모듈은 이제 사용자 관리 관련 기능만 담당
// 인증 관련 기능은 auth 모듈로 이동됨

export const getUserSchema = z.object({
  id: z.string().transform(Number),
});

export const updateUserSchema = z.object({
  id: z.string().transform(Number),
  name: z.string().min(2).optional(),
  picture: z.string().optional(),
});

export const deleteUserSchema = z.object({
  id: z.string().transform(Number),
});

export type GetUserInput = z.infer<typeof getUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
