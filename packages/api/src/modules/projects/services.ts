import { db, projects, roles } from '@repo/db';
import { eq, and } from 'drizzle-orm';
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
      { roleName: 'prj_admin', prjId: newProject.id, roleDesc: 'Project Administrator' },
      { roleName: 'prj_write', prjId: newProject.id, roleDesc: 'Project Write Access' },
      { roleName: 'prj_read', prjId: newProject.id, roleDesc: 'Project Read Access' },
    ];

    await tx.insert(roles).values(defaultRoles);

    return newProject;
  });
};

export const deleteProject = async (id: number, ownerId: number) => {
  const projectArr = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));

  if (projectArr.length === 0) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Project not found or you do not have permission to delete it.',
    });
  }

  await db.delete(projects).where(eq(projects.id, id));

  return { success: true };
};

export const listProjects = async (ownerId: number) => {
  return await db.select().from(projects).where(eq(projects.ownerId, ownerId));
};
