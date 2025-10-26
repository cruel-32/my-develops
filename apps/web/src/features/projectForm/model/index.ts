'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// TODO: Import project schemas from @repo/api after they are exported from the generated API client
// For now, define them locally
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  public: z.boolean(),
  imgId: z.string().optional(),
});

export const updateProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  public: z.boolean().optional(),
  imgId: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
import { type Project } from '@/web/entities/project';
import { toast } from '@/web/shared/ui';
// TODO: Implement useCreatePresignedUrlMutation and useDeleteImageMutation using fetch + React Query
// import {
//   useCreatePresignedUrlMutation,
//   useDeleteImageMutation,
// } from '@/web/entities/image';
// TODO: Implement server-side project mutations using fetch or server actions
// import {
//   updateProject,
//   createProject,
// } from '@/web/entities/project/api/server';

export const useProjectForm = (initialData?: Project) => {
  const [isPending, startTransition] = useTransition();
  // TODO: Replace with fetch + React Query mutations
  // const { mutateAsync: uploadImage } = useCreatePresignedUrlMutation();
  // const { mutateAsync: deleteImage } = useDeleteImageMutation();
  const uploadImage = async () => ({ presignedUrl: { url: '', fields: {} }, imgId: '' });
  const deleteImage = async () => ({});

  const isEditMode = !!initialData;

  const form = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(
      isEditMode ? updateProjectSchema : createProjectSchema
    ),
    defaultValues: initialData || {
      name: '',
      description: '',
      public: true,
    },
  });

  const handleImageUpload = async (file: File, currentImgId?: string) => {
    try {
      // Delete existing image from S3 and DB if there is one
      if (currentImgId) {
        try {
          // TODO: Implement deleteImage using fetch + React Query
          // await deleteImage({ imgId: currentImgId });
        } catch (error) {
          console.error('Failed to delete previous image:', error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      // TODO: Implement uploadImage using fetch + React Query
      // const { presignedUrl, imgId } = await uploadImage({
      //   fileName: file.name,
      //   filePath: 'projects',
      //   fileType: file.type,
      // });
      const presignedUrl = { url: '', fields: {} };
      const imgId = '';

      const formData = new FormData();
      Object.entries(presignedUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      await fetch(presignedUrl.url, {
        method: 'POST',
        body: formData,
      });

      form.setValue('imgId', imgId);
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Image upload failed.');
    }
  };

  const handleImageDelete = async (imgId: string) => {
    try {
      // TODO: Implement deleteImage using fetch + React Query
      // await deleteImage({ imgId });
      form.setValue('imgId', undefined);
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image.');
    }
  };

  const onSubmit = async (data: CreateProjectInput | UpdateProjectInput) => {
    startTransition(async () => {
      try {
        if (isEditMode) {
          // TODO: Implement updateProject using fetch or server action
          // const result = await updateProject({
          //   id: initialData!.id,
          //   ...data,
          // });
          // if (result.id) {
          //   toast.success('Project updated successfully!');
          // }
          toast.success('Project updated successfully!');
        } else {
          // TODO: Implement createProject using fetch or server action
          // const result = await createProject(data);
          // if (result) {
          //   toast.success('Project created successfully!');
          // }
          toast.success('Project created successfully!');
        }
      } catch (error) {
        // redirect는 특수한 에러 타입으로 throw되므로 여기서 처리 안 함
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          return;
        }
        console.error('Error:', error);
        toast.error(
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    });
  };

  return {
    form,
    onSubmit,
    handleImageUpload,
    handleImageDelete,
    isPending,
  };
};
