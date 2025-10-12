import * as operatorRoleService from './services';
import type {
  CreateOperatorRoleInput,
  DeleteOperatorRoleInput,
} from './interfaces';

export const createOperatorRoleController = async ({
  input,
  ctx,
}: {
  input: CreateOperatorRoleInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  return await operatorRoleService.createOperatorRole(input, ctx.user.role);
};

export const deleteOperatorRoleController = async ({
  input,
  ctx,
}: {
  input: DeleteOperatorRoleInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  return await operatorRoleService.deleteOperatorRole(input, ctx.user.role);
};

export const listOperatorRolesController = async () => {
  return await operatorRoleService.listOperatorRoles();
};
