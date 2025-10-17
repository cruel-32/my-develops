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

    // 2. If an imgId is provided, associate it with the new project
    if (input.imgId) {
      await tx
        .update(images)
        .set({ prjId: newProject.id })
        .where(eq(images.id, input.imgId));
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

  // Delete associated images from S3 and DB
  const imageArr = await db.select().from(images).where(eq(images.prjId, id));

  const image = imageArr[0];

  if (image && image.imgUrl) {
    try {
      // Extract S3 key from imgUrl
      // imgUrl format: http://localhost:9000/my-develops/projects/filename.jpg
      const urlParts = image.imgUrl.split('/');
      const bucketIndex = urlParts.findIndex((part) => part === process.env.S3_BUCKET_NAME);

      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const key = urlParts.slice(bucketIndex + 1).join('/');

        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
          })
        );
      }
    } catch (error) {
      console.error(
        `Failed to delete image from S3: ${image.imgUrl}`,
        error
      );
    }
  }

  // Delete project (cascades will delete roles and images from DB)
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

export const getProject = async (id: number) => {
  const projectArr = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      public: projects.public,
      ownerId: projects.ownerId,
      imgId: images.id,
      imgUrl: images.imgUrl,
    })
    .from(projects)
    .leftJoin(images, eq(projects.id, images.prjId))
    .where(eq(projects.id, id));

  return projectArr[0];
};

export const updateProject = async (
  input: CreateProjectInput & { id: number },
  user: { id: number; role?: string }
) => {
  return await db.transaction(async (tx) => {
    // 1. Verify ownership/permissions
    const projectArr = await tx
      .select()
      .from(projects)
      .where(eq(projects.id, input.id));

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
        message: 'You do not have permission to update this project.',
      });
    }

    // 2. Handle image changes
    // Get current image associated with this project
    const currentImageArr = await tx
      .select()
      .from(images)
      .where(eq(images.prjId, input.id))
      .limit(1);

    const currentImage = currentImageArr[0];

    // If imgId is provided and it's different from current image, or if imgId is null (removing image)
    if (currentImage && (!input.imgId || currentImage.id !== input.imgId)) {
      // Delete old image from S3
      if (currentImage.imgUrl) {
        try {
          const urlParts = currentImage.imgUrl.split('/');
          const bucketIndex = urlParts.findIndex(
            (part) => part === process.env.S3_BUCKET_NAME
          );

          if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
            const key = urlParts.slice(bucketIndex + 1).join('/');

            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
              })
            );
          }
        } catch (error) {
          console.error(
            `Failed to delete old image from S3: ${currentImage.imgUrl}`,
            error
          );
        }
      }

      // Delete old image from DB
      await tx.delete(images).where(eq(images.id, currentImage.id));
    }

    // 3. Update the project details
    const updatedProjectArr = await tx
      .update(projects)
      .set({
        name: input.name,
        description: input.description,
        public: input.public,
      })
      .where(eq(projects.id, input.id))
      .returning();

    const updatedProject = updatedProjectArr[0];

    if (!updatedProject) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update project.',
      });
    }

    // 4. Associate new image if provided
    if (input.imgId) {
      await tx
        .update(images)
        .set({ prjId: input.id })
        .where(eq(images.id, input.imgId));
    }

    return updatedProject;
  });
};
