import { Request, Response } from 'express';
import * as operatorRoleService from './services';
import type {
  CreateOperatorRoleRequest,
  DeleteOperatorRoleRequest,
} from './routes';

export const createOperatorRoleController = async (
  req: CreateOperatorRoleRequest,
  res: Response
) => {
  const result = await operatorRoleService.createOperatorRole(
    req.body,
    req.user!
  );
  res.status(201).json(result);
};

export const deleteOperatorRoleController = async (
  req: DeleteOperatorRoleRequest,
  res: Response
) => {
  const result = await operatorRoleService.deleteOperatorRole(
    req.params,
    req.user!
  );
  res.json(result);
};

export const listOperatorRolesController = async (
  req: Request,
  res: Response
) => {
  const result = await operatorRoleService.listOperatorRoles();
  res.json(result);
};
