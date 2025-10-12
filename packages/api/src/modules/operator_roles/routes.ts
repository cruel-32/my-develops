import { protectedProcedure, router } from '@/api/trpc';
import {
  createOperatorRoleSchema,
  deleteOperatorRoleSchema,
} from './interfaces';
import {
  createOperatorRoleController,
  deleteOperatorRoleController,
  listOperatorRolesController,
} from './controllers';

export const operatorRolesRouter = router({
  create: protectedProcedure
    .input(createOperatorRoleSchema)
    .mutation(createOperatorRoleController),
  delete: protectedProcedure
    .input(deleteOperatorRoleSchema)
    .mutation(deleteOperatorRoleController),
  list: protectedProcedure.query(listOperatorRolesController),
});
