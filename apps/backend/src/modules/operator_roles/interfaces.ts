import { z } from 'zod';

export const createOperatorRoleSchema = z.object({
  userId: z.string().transform(Number),
  roleId: z.string().transform(Number),
});

export const deleteOperatorRoleSchema = z.object({
  userId: z.string().transform(Number),
  roleId: z.string().transform(Number),
});

export type CreateOperatorRoleInput = z.infer<typeof createOperatorRoleSchema>;
export type DeleteOperatorRoleInput = z.infer<typeof deleteOperatorRoleSchema>;
