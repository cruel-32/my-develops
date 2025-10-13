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
  try {
    return await operatorRoleService.createOperatorRole(input, ctx.user.role);
  } catch (error) {
    console.error('Error in createOperatorRoleController:', error);
    throw error;
  }
};

export const deleteOperatorRoleController = async ({
  input,
  ctx,
}: {
  input: DeleteOperatorRoleInput;
  ctx: { user: { id: number; role?: string } };
}) => {
  try {
    return await operatorRoleService.deleteOperatorRole(input, ctx.user.role);
  } catch (error) {
    console.error('Error in deleteOperatorRoleController:', error);
    throw error;
  }
};

export const listOperatorRolesController = async () => {
  try {
    return await operatorRoleService.listOperatorRoles();
  } catch (error) {
    console.error('Error in listOperatorRolesController:', error);
    throw error;
  }
};
