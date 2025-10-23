import { z } from 'zod';

export const createOperatorRoleSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
});

export const deleteOperatorRoleSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
});

export type CreateOperatorRoleInput = z.infer<typeof createOperatorRoleSchema>;
export type DeleteOperatorRoleInput = z.infer<typeof deleteOperatorRoleSchema>;
