'use client';
import { type Project } from '@/web/entities/project';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  updateProjectSchema,
  CreateProjectInput,
  UpdateProjectInput,
} from './model';
import { toast } from '@/web/shared/ui';
import {
  postApiImagesUpload,
  deleteApiImagesImgid,
  postApiProjectsCreate,
  putApiProjectsId,
} from '@/web/shared/api';

export const useProjectForm = (initialData?: Project) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(
      isEditMode ? updateProjectSchema : createProjectSchema
    ),
    defaultValues: initialData
      ? { ...initialData, imgId: initialData.imgId ?? undefined }
      : {
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
          await deleteApiImagesImgid(currentImgId);
        } catch (error) {
          console.error('Failed to delete previous image:', error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      // TODO: Implement uploadImage using fetch + React Query
      const result = await postApiImagesUpload({
        fileName: file.name,
        filePath: 'projects',
        fileType: file.type,
      });

      const { presignedUrl, imgId } = result;

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
      await deleteApiImagesImgid(imgId);
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
          const result = await putApiProjectsId(initialData!.id, data);
          if (result.id) {
            toast.success('Project updated successfully!');
          }
        } else {
          // TODO: Implement createProject using fetch or server action
          const result = await postApiProjectsCreate(
            data as CreateProjectInput
          );
          if (result) {
            toast.success('Project created successfully!');
          }
        }
        router.push(`/project`);
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
