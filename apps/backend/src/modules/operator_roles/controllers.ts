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
  try {
    const result = await operatorRoleService.createOperatorRole(req);
    res.json(result);
  } catch (error) {
    console.error('Error in createOperatorRoleController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteOperatorRoleController = async (
  req: DeleteOperatorRoleRequest,
  res: Response
) => {
  try {
    const result = await operatorRoleService.deleteOperatorRole(req);
    res.json(result);
  } catch (error) {
    console.error('Error in deleteOperatorRoleController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listOperatorRolesController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await operatorRoleService.listOperatorRoles();
    res.json(result);
  } catch (error) {
    console.error('Error in listOperatorRolesController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
