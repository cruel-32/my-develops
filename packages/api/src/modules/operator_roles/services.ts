import { db, operatorRoles, roles, users } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { CreateOperatorRoleInput, DeleteOperatorRoleInput } from './interfaces';

export const createOperatorRole = async (
  input: CreateOperatorRoleInput,
  creatorRole?: string
) => {
  // Check if the target user is verified
  const userArr = await db.select().from(users).where(eq(users.id, input.userId));
  const user = userArr[0];

  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Target user not found.' });
  }

  if (!user.is_verified) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Cannot assign a role to an unverified user.',
    });
  }

  // Get the role name from the database
  const roleArr = await db.select().from(roles).where(eq(roles.id, input.roleId));
  const role = roleArr[0];

  if (!role || !role.roleName) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Role not found.' });
  }

  // Prevent creation of 'super_admin' role assignment
  if (role.roleName === 'super_admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Cannot assign super_admin role.',
    });
  }

  // Require creator to be 'super_admin' to create an 'admin' role assignment
  if (role.roleName === 'admin' && creatorRole !== 'super_admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only a super_admin can assign the admin role.',
    });
  }

  const newOperatorRoleArr = await db
    .insert(operatorRoles)
    .values(input)
    .returning();
  
  const newOperatorRole = newOperatorRoleArr[0]
  if(!newOperatorRole){
    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create operator role.',
      });
  }

  return newOperatorRole;
};

export const deleteOperatorRole = async (
  input: DeleteOperatorRoleInput,
  creatorRole?: string
) => {
  // Get the role name from the database
  const roleArr = await db.select().from(roles).where(eq(roles.id, input.roleId));
  const role = roleArr[0];

  // Require creator to be 'super_admin' to delete an 'admin' role assignment
  if (role && role.roleName === 'admin' && creatorRole !== 'super_admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only a super_admin can delete an admin role assignment.',
    });
  }

  const deleted = await db
    .delete(operatorRoles)
    .where(
      and(
        eq(operatorRoles.userId, input.userId),
        eq(operatorRoles.roleId, input.roleId)
      )
    )
    .returning();

  if (deleted.length === 0) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Operator role not found.',
    });
  }

  return { success: true };
};

export const listOperatorRoles = async () => {
  // Join with users and roles to provide more context
  return await db
    .select({
      userId: operatorRoles.userId,
      roleId: operatorRoles.roleId,
      // userName: users.name, // Assuming 'users' schema has a 'name' field
      // roleName: roles.roleName, // Assuming 'roles' schema has a 'roleName' field
    })
    .from(operatorRoles)
    // .leftJoin(users, eq(operatorRoles.userId, users.id))
    // .leftJoin(roles, eq(operatorRoles.roleId, roles.id));
};
