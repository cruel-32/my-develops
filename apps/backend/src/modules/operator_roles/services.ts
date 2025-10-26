import { db, operatorRoles, roles, users } from '@/be/db';
import { eq, and } from 'drizzle-orm';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
  InternalServerError,
} from '@/be/lib/errors';
import type {
  CreateOperatorRoleRequest,
  DeleteOperatorRoleRequest,
} from './routes';
import type { DeleteOperatorRoleInput } from './interfaces';

export const createOperatorRole = async (req: CreateOperatorRoleRequest) => {
  const { userId, roleId } = req.body;

  if (!req.user) {
    throw new NotFoundError('User not found.');
  }

  const operatorRolesArr = await db
    .select({
      roleId: operatorRoles.roleId,
      roleName: roles.roleName,
    })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, req.user.id))
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  const operatorRoleNames = operatorRolesArr.map(
    (role) => role.roleName || 'user'
  );

  if (operatorRolesArr.length === 0) {
    throw new NotFoundError('Operator roles not found.');
  }

  if (
    !operatorRoleNames.includes('super_admin') &&
    !operatorRoleNames.includes('admin')
  ) {
    throw new AuthorizationError('Permission denied.');
  }

  // Check if the target user is verified
  const userArr = await db.select().from(users).where(eq(users.id, userId));
  const user = userArr[0];

  if (!user) {
    throw new NotFoundError('Target user not found.');
  }

  if (!user.is_verified) {
    throw new ValidationError('Cannot assign a role to an unverified user.');
  }

  // Get the role name from the database
  const roleArr = await db.select().from(roles).where(eq(roles.id, roleId));
  const role = roleArr[0];

  if (!role || !role.roleName) {
    throw new NotFoundError('Role not found.');
  }

  // Prevent creation of 'super_admin' role assignment
  if (role.roleName === 'super_admin') {
    throw new ValidationError('Cannot assign super_admin role.');
  }

  // Require creator to be 'super_admin' to create an 'admin' role assignment
  if (role.roleName === 'admin' && !operatorRoleNames.includes('super_admin')) {
    throw new AuthorizationError(
      'Only a super_admin can assign the admin role.'
    );
  }

  const newOperatorRoleArr = await db
    .insert(operatorRoles)
    .values({ userId, roleId })
    .returning();

  const newOperatorRole = newOperatorRoleArr[0];
  if (!newOperatorRole) {
    throw new InternalServerError('Failed to create operator role.');
  }

  return { data: newOperatorRole };
};

export const deleteOperatorRole = async (
  params: DeleteOperatorRoleInput,
  user: { id: number; role?: string }
) => {
  const { userId, roleId } = params;

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const operatorRolesArr = await db
    .select({
      roleId: operatorRoles.roleId,
      roleName: roles.roleName,
    })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, user.id))
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  if (operatorRolesArr.length === 0) {
    throw new NotFoundError('Operator roles not found.');
  }

  if (operatorRolesArr.some((role) => role.roleName === 'super_admin')) {
    throw new ValidationError('Cannot delete super_admin role.');
  }

  const targetRoles = await db
    .select({
      userId: operatorRoles.userId,
      roleId: operatorRoles.roleId,
      roleName: roles.roleName,
    })
    .from(operatorRoles)
    .where(
      and(eq(operatorRoles.userId, userId), eq(operatorRoles.roleId, roleId))
    )
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  if (targetRoles.length === 0) {
    throw new NotFoundError('Target role not found.');
  }

  if (targetRoles[0]?.roleName === 'super_admin') {
    throw new ValidationError('Cannot delete super_admin role.');
  }

  const deleted = await db
    .delete(operatorRoles)
    .where(
      and(eq(operatorRoles.userId, userId), eq(operatorRoles.roleId, roleId))
    )
    .returning();

  if (deleted.length === 0) {
    throw new InternalServerError('Failed to delete operator role.');
  }

  return { data: deleted };
};

export const listOperatorRoles = async () => {
  // Join with users and roles to provide more context
  const operatorRolesList = await db
    .select({
      userId: operatorRoles.userId,
      roleId: operatorRoles.roleId,
      userName: users.name,
      roleName: roles.roleName,
    })
    .from(operatorRoles)
    .leftJoin(users, eq(operatorRoles.userId, users.id))
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  return {
    operatorRoles: operatorRolesList,
  };
};
