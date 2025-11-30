import { db, projects, roles, operatorRoles, images } from '@/be/db';
import { eq, and, inArray, or, isNotNull } from 'drizzle-orm';
import type {
  PostApiProjectsCreateMutationRequest,
  PutApiProjectsIdMutationRequest,
} from '@repo/api';
import { s3 } from './s3';
import {
  AuthorizationError,
  InternalServerError,
  NotFoundError,
} from '@/be/lib/errors';

export const createProject = async (
  input: PostApiProjectsCreateMutationRequest,
  ownerId: number
) => {
  return await db.transaction(async (tx) => {
    // 1. Create the project
    const newProjectArr = await tx
      .insert(projects)
      .values({
        name: input.name,
        description: input.description ?? '',
        public: input.public ?? true,
        ownerId,
        imgId: input.imgId || null,
      })
      .returning();

    const newProject = newProjectArr[0];
    if (!newProject) {
      throw new InternalServerError('Failed to create project.');
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

    return {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      public: newProject.public,
      ownerId: newProject.ownerId,
    };
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
    throw new NotFoundError('Project not found.');
  }

  if (user.role !== 'super_admin' && project.ownerId !== user.id) {
    throw new AuthorizationError('Permission denied.');
  }

  // Delete associated images from S3 and DB
  const imageArr = await db.select().from(images).where(eq(images.prjId, id));

  const image = imageArr[0];

  if (image && image.imgUrl) {
    try {
      // Extract S3 key from imgUrl
      // imgUrl format: http://localhost:9000/my-develops/projects/filename.jpg
      const urlParts = image.imgUrl.split('/');
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
      console.error(`Failed to delete image from S3: ${image.imgUrl}`, error);
    }
  }

  // Delete project (cascades will delete roles and images from DB)
  await db.delete(projects).where(eq(projects.id, id));

  return { deletedProjectId: id };
};

export const listProjects = async (user: {
  id: number;
  email: string;
  name: string;
}) => {
  const userRoles = await db
    .select({
      userId: operatorRoles.userId,
      roleId: operatorRoles.roleId,
      roleName: roles.roleName,
      prjId: roles.prjId,
    })
    .from(operatorRoles)
    .where(eq(operatorRoles.userId, user.id))
    .leftJoin(roles, eq(operatorRoles.roleId, roles.id));

  if (!userRoles || userRoles.length === 0) {
    throw new AuthorizationError('Permission denied.');
  }

  let projectList;

  if (
    userRoles.some(
      (role) => role.roleName === 'super_admin' || role.roleName === 'admin'
    )
  ) {
    const query = db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        public: projects.public,
        ownerId: projects.ownerId,
        imgUrl: images.imgUrl,
      })
      .from(projects)
      .leftJoin(images, eq(projects.id, images.prjId));
    projectList = await query;
  } else {
    // Only list projects where user has a role assignment
    const query = db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        public: projects.public,
        ownerId: projects.ownerId,
        imgUrl: images.imgUrl,
      })
      .from(projects)
      .leftJoin(images, eq(projects.id, images.prjId))
      .where(
        inArray(
          projects.id,
          userRoles
            .filter((userRole) => userRole.prjId)
            .map((userRole) => userRole.prjId as number)
        )
      );
    projectList = await query;
  }

  return {
    projects: projectList,
  };
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

  const project = projectArr[0];

  if (!project) {
    throw new NotFoundError('Project not found.');
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    public: project.public,
    ownerId: project.ownerId,
    imgId: project.imgId,
    imgUrl: project.imgUrl,
  };
};

export const updateProject = async (
  input: PutApiProjectsIdMutationRequest & { id: number },
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
      throw new NotFoundError('Project not found.');
    }

    if (user.role !== 'super_admin' && project.ownerId !== user.id) {
      throw new AuthorizationError('Permission denied.');
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
      throw new InternalServerError('Failed to update project.');
    }

    // 4. Associate new image if provided
    if (input.imgId) {
      await tx
        .update(images)
        .set({ prjId: input.id })
        .where(eq(images.id, input.imgId));
    }

    return {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      public: updatedProject.public,
      ownerId: updatedProject.ownerId,
    };
  });
};
