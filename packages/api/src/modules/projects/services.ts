import { db, projects, roles, operatorRoles, images } from '@repo/db';
import { eq, and, inArray, or, isNotNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { CreateProjectInput } from './interfaces';
import { s3 } from './s3';

export const createProject = async (
  input: CreateProjectInput,
  ownerId: number
) => {
  return await db.transaction(async (tx) => {
    // 1. Create the project
    const newProjectArr = await tx
      .insert(projects)
      .values({
        name: input.name,
        description: input.description,
        public: input.public,
        ownerId,
      })
      .returning();

    const newProject = newProjectArr[0];
    if (!newProject) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create project.',
      });
    }

    // 2. If an imageId is provided, associate it with the new project
    if (input.imageId) {
      await tx
        .update(images)
        .set({ prjId: newProject.id })
        .where(eq(images.id, input.imageId));
    }

    // 3. Create default roles for the project
    type NewRole = typeof roles.$inferInsert;
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

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const deleteProject = async (
  id: number,
  user: { id: number; role?: string }
) => {
  const projectArr = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  const project = projectArr[0];

  if (!project) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Project not found.',
    });
  }

  if (user.role !== 'super_admin' && project.ownerId !== user.id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to delete this project.',
    });
  }

  const imageArr = await db.select().from(images).where(eq(images.prjId, id));

  const image = imageArr[0];

  if (image && image.imgUrl) {
    try {
      const key = image.imgUrl.split('/').pop();
      if (key) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
          })
        );
      }
    } catch (error) {
      console.error(
        `Failed to delete image from MinIO: ${image.imgUrl}`,
        error
      );
    }
  }

  await db.delete(projects).where(eq(projects.id, id));

  return { success: true };
};

export const listProjects = async (user: { id: number; role?: string }) => {
  const query = db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      public: projects.public,
      ownerId: projects.ownerId,
      // ... any other fields from projects you need
      imgUrl: images.imgUrl,
    })
    .from(projects)
    .leftJoin(images, eq(projects.id, images.prjId));

  if (user.role === 'super_admin' || user.role === 'admin') {
    return await query;
  }

  // For regular users, get projects they own or have a role in.
  const userRoleIds = await db
    .select({ roleId: operatorRoles.roleId })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, user.id));

  const roleIds = userRoleIds
    .map((r) => r.roleId)
    .filter((id): id is number => id !== null && id !== undefined);

  if (roleIds.length === 0) {
    return await query.where(eq(projects.ownerId, user.id));
  }

  const projectIdsFromRoles = await db
    .select({ projectId: roles.prjId })
    .from(roles)
    .where(and(inArray(roles.id, roleIds), isNotNull(roles.prjId)));

  const projectIds = projectIdsFromRoles.map((p) => p.projectId as number);

  return await query.where(
    or(eq(projects.ownerId, user.id), inArray(projects.id, projectIds))
  );
};
