'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectInput,
  updateProjectSchema,
  UpdateProjectInput,
} from '@repo/api/modules/projects/interfaces';
import { type Project } from '@/web/entities/project';
import { toast } from '@/web/shared/ui';
import {
  useCreatePresignedUrlMutation,
  useDeleteImageMutation,
} from '@/web/entities/image';
import {
  updateProject,
  createProject,
} from '@/web/entities/project/api/server';

export const useProjectForm = (initialData?: Project) => {
  const [isPending, startTransition] = useTransition();
  const { mutateAsync: uploadImage } = useCreatePresignedUrlMutation();
  const { mutateAsync: deleteImage } = useDeleteImageMutation();

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
          await deleteImage({ imgId: currentImgId });
        } catch (error) {
          console.error('Failed to delete previous image:', error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const { presignedUrl, imgId } = await uploadImage({
        fileName: file.name,
        filePath: 'projects',
        fileType: file.type,
      });

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
      await deleteImage({ imgId });
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
          // 서버 액션 호출 (업데이트)
          const result = await updateProject({
            id: initialData!.id,
            ...data,
          });
          if (result.id) {
            toast.success('Project updated successfully!');
          }
        } else {
          // 서버 액션 호출 (생성)
          const result = await createProject(data);
          if (result) {
            toast.success('Project created successfully!');
          }
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
