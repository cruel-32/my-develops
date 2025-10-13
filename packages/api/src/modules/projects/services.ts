import { db, projects, roles, operatorRoles } from '@repo/db';
import { eq, and, inArray, or, isNotNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { CreateProjectInput } from './interfaces';

export const createProject = async (
  input: CreateProjectInput,
  ownerId: number
) => {
  return await db.transaction(async (tx) => {
    // Create the project
    const newProjectArr = await tx
      .insert(projects)
      .values({ ...input, ownerId })
      .returning();

    const newProject = newProjectArr[0];
    if (!newProject) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create project.',
      });
    }

    // Define the type for the role to be inserted
    type NewRole = typeof roles.$inferInsert;

    // Create default roles for the project
    const defaultRoles: NewRole[] = [
      {
        roleName: 'prj_admin',
        prjId: newProject.id,
        roleDesc: 'Project Administrator',
      },
      {
        roleName: 'prj_write',
        prjId: newProject.id,
        roleDesc: 'Project Write Access',
      },
      {
        roleName: 'prj_read',
        prjId: newProject.id,
        roleDesc: 'Project Read Access',
      },
    ];

    await tx.insert(roles).values(defaultRoles);

    return newProject;
  });
};

export const deleteProject = async (
  id: number,
  user: { id: number; role?: string }
) => {
  if (user.role !== 'super_admin') {
    const projectArr = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));

    if (projectArr.length === 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this project.',
      });
    }
  }

  await db.delete(projects).where(eq(projects.id, id));

  return { success: true };
};

export const listProjects = async (user: { id: number; role?: string }) => {
  if (user.role === 'super_admin' || user.role === 'admin') {
    return await db.select().from(projects);
  }

  // For regular users, get projects they own or have a role in.
  const userRoleIds = await db
    .select({ roleId: operatorRoles.roleId })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, user.id));

  const roleIds = userRoleIds.map((r) => r.roleId);

  const projectIdsFromRoles = await db
    .select({ projectId: roles.prjId })
    .from(roles)
    .where(and(inArray(roles.id, roleIds as number[]), isNotNull(roles.prjId)));

  const projectIds = projectIdsFromRoles.map((p) => p.projectId as number);

  return await db
    .select()
    .from(projects)
    .where(or(eq(projects.ownerId, user.id), inArray(projects.id, projectIds)));
};
